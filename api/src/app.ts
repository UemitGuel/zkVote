import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

type UserState = "Registered" | "Voted";
type Voter = {
    userAddress: string,
    state: UserState,
    id: number,
    registrationHash?: string,
    voteHash?: string,
}
type Poll = {
    question: string,
    registrationDeadline: Date,
    votingDeadline: Date,
    noVotes: number,
    yesVotes: number,
}
let currentPoll: Poll | undefined;
let registeredVoters: { [key: string]: Voter } = {};
let currentId = 0;

type StageDeadlines = {
    registration: string,
    voting: string,
}

app.post('/create_poll', (req: Request, res: Response) => {
    const { question } = req.body;
    const registrationRelativeDeadline = 5 * 60 * 1000; // 10 minutes
    const votingRelativeDeadline = 10 * 60 * 1000; // 1 hour
    currentPoll = {
        question,
        registrationDeadline: new Date(Date.now() + registrationRelativeDeadline),
        votingDeadline: new Date(Date.now() + votingRelativeDeadline),
        noVotes: 0,
        yesVotes: 0,
    };
});

app.post('/delete_poll', (req: Request, res: Response) => {
    currentPoll = undefined;
});

// API endpoint to get vote status
app.get('/vote_status/:user_address', (req: Request, res: Response) => {
    const userAddress = req.params.user_address;
    const voteStatus = getVoteStatus(userAddress);
    const pollQuestion = currentPoll ? currentPoll.question : "";

    // Replace this with your actual logic to get the deadline for each stage
    const deadlineForEachStage = getDeadlineForStage();

    res.json({
        vote_status: voteStatus,
        poll_question: pollQuestion,
        deadlines: deadlineForEachStage,
    });
});

// API endpoint to register a voter
app.post('/register_voter', (req: Request, res: Response) => {
    const { user_address, signed_hash } = req.body;
    if(!user_address) {
        res.status(400).json({ error: "Invalid request: user address not provided" });
        return;
    }
    if(!signed_hash) {
        res.status(400).json({ error: "Invalid request: signed hash not provided" });
        return;
    }
    if(!currentPoll) {
        res.status(400).json({ error: "No poll is currently active" });
        return;
    }
    if(getPollStatus(currentPoll) !== "Registration") {
        res.status(400).json({ error: "Registration has ended" });
        return;
    }
    if(registeredVoters[user_address]) {
        res.status(400).json({ error: "User is already registered" });
        return;
    }
    const result = registerVoter(user_address, signed_hash);
    res.json(result);
});

// API endpoint to cast a vote
app.post('/cast_vote', (req: Request, res: Response) => {
    const { user_address, signed_hash, vote, id } = req.body;
    if(!user_address) {
        res.status(400).json({ error: "Invalid request: user address not provided" });
        return;
    }
    if(!signed_hash) {
        res.status(400).json({ error: "Invalid request: signed hash not provided" });
        return;
    }
    if(!vote) {
        res.status(400).json({ error: "Invalid request: vote not provided" });
        return;
    }
    if(!id) {
        res.status(400).json({ error: "Invalid request: id not provided" });
        return;
    }
    if(!currentPoll) {
        res.status(400).json({ error: "No poll is currently active" });
        return;
    }
    if(getPollStatus(currentPoll) !== "Voting") {
        res.status(400).json({ error: "Poll is not in voting state" });
        return;
    }
    if(!registeredVoters[user_address]) {
        res.status(400).json({ error: "User is not registered" });
        return;
    }
    if(registeredVoters[user_address].state === "Voted") {
        res.status(400).json({ error: "User has already voted" });
        return;
    }
    castVote(user_address, signed_hash, vote, id);
});

// Helper function to get vote status
function getVoteStatus(userAddress: string): string {
    // Replace this with your actual logic to get the vote status
    if(!currentPoll) {
        return "None";
    }
    let pollStatus = getPollStatus(currentPoll);
    if(pollStatus === "Registration") {
        if (registeredVoters[userAddress]) {
            return "Registered";
        } else {
            return "CanRegister";
        }
    } else if(pollStatus === "Voting") {
        if (registeredVoters[userAddress]) {
            if (registeredVoters[userAddress].state === "Voted") {
                return "Voted";
            }
            return "CanVote";
        } else {
            return "MissedRegistration";
        }
    }
    return "Ended";
}

function getPollStatus(poll: Poll): string {
    let now = new Date();
    if (now < new Date(poll.registrationDeadline)) {
        return "Registration";
    } else if (now < new Date(poll.votingDeadline)) {
        return "Voting";
    } else {
        return "Ended";
    }
}

// Helper function to register a voter
function registerVoter(userAddress: string, registrationHash: string): number {
    let id = currentId++;
    registeredVoters[userAddress] = {
        userAddress,
        state: "Registered",
        id,
        registrationHash,
    };
    return id;
}

// Helper function to cast a vote
function castVote(userAddress: string, signedHash: string, vote: string, id: string) {
    if(!currentPoll) {
        return { Err: "No poll is currently active" };
    }
    if(!registeredVoters[userAddress]) {
        return { Err: "User is not registered" };
    }
    if(registeredVoters[userAddress].state === "Voted") {
        return { Err: "User has already voted" };
    }
    if(registeredVoters[userAddress].id !== parseInt(id)) {
        return { Err: "Invalid ID" };
    }
    if(registeredVoters[userAddress].registrationHash !== signedHash) {
        return { Err: "Invalid registration hash" };
    }
    if(vote !== "Yes" && vote !== "No") {
        return { Err: "Invalid vote" };
    }
    if(getPollStatus(currentPoll) !== "Voting") {
        return { Err: "Voting has ended" };
    }
    if(vote === "Yes") {
        currentPoll.yesVotes++;
    } else {
        currentPoll.noVotes++;
    }
    registeredVoters[userAddress].state = "Voted";
    registeredVoters[userAddress].voteHash = signedHash;
    return;
}

// Helper function to get the deadline for each stage
function getDeadlineForStage(): StageDeadlines {
    if(!currentPoll) {
        return { registration: "", voting: "" };
    }
    return {
        registration: currentPoll.registrationDeadline.toISOString(),
        voting: currentPoll.votingDeadline.toISOString(),
    };
}

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

