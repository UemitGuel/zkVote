import express, { Request, Response } from 'express';
import {randomBytes, hexlify} from "ethers";

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
    currentStage?: "Registration" | "Voting" | "Ended",
    registrationDeadline: Date,
    votingDeadline: Date,
    noVotes: number,
    yesVotes: number,
    currentId: number,
    registeredVoters: { [key: string]: Voter },
}
let currentPoll: Poll | undefined;

type StageDeadlines = {
    registration: string,
    voting: string,
}

app.post('/set_stage', (req: Request, res: Response) => {
    const { stage } = req.body;

    if(["Registration", "Voting", "Ended"].indexOf(stage) === -1) {
        res.status(400).json({ error: "Invalid stage" });
        return;
    }
    if(!currentPoll) {
        res.status(400).json({ error: "No poll is currently active" });
        return;
    }

    currentPoll.currentStage = stage;

    res.status(200).json({ success: true });
});

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
        currentId: 0,
        registeredVoters: {},
    };
    res.status(200).json({ success: true });
});

app.post('/delete_poll', (req: Request, res: Response) => {
    currentPoll = undefined;
    res.status(200).json({ success: true });
});

// API endpoint to get vote status
app.get('/vote_status/:user_address', (req: Request, res: Response) => {
    const userAddress = req.params.user_address;
    const voteStatus = getVoteStatus(userAddress);
    const pollQuestion = currentPoll ? currentPoll.question : "";

    // Replace this with your actual logic to get the deadline for each stage
    const deadlineForEachStage = getDeadlineForStage();

    if(voteStatus === "CanRegister") {
        const registrationHash = hexlify(randomBytes(32));
        res.json({
            vote_status: voteStatus,
            poll_question: pollQuestion,
            hash_to_sign: registrationHash,
            deadlines: deadlineForEachStage,
        });
    } else if (voteStatus === "CanVote") {
        const noHash = hexlify(randomBytes(32));
        const yesHash = hexlify(randomBytes(32));
        res.json({
            vote_status: voteStatus,
            poll_question: pollQuestion,
            no_hash_to_sign: noHash,
            yes_hash_to_sign: yesHash,
        });

    } else if (voteStatus === "Ended") {
        console.log("Vote has ended:", currentPoll);
        res.json({
            vote_status: voteStatus,
            poll_question: pollQuestion,
            no_votes: currentPoll?.noVotes,
            yes_votes: currentPoll?.yesVotes,
            deadlines: deadlineForEachStage,
        });
    } else {
        res.json({
            vote_status: voteStatus,
            poll_question: pollQuestion,
            deadlines: deadlineForEachStage,
        });
    }
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
    if(currentPoll.registeredVoters[user_address]) {
        res.status(400).json({ error: "User is already registered" });
        return;
    }
    const result = registerVoter(user_address, signed_hash);
    res.json({id: result});
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
    if(!currentPoll.registeredVoters[user_address]) {
        res.status(400).json({ error: "User is not registered" });
        return;
    }
    if(currentPoll.registeredVoters[user_address].state === "Voted") {
        res.status(400).json({ error: "User has already voted" });
        return;
    }
    castVote(user_address, signed_hash, vote, id);
    res.json({ success: true });
});

// Helper function to get vote status
function getVoteStatus(userAddress: string): string {
    // Replace this with your actual logic to get the vote status
    if(!currentPoll) {
        return "None";
    }
    let pollStatus = getPollStatus(currentPoll);
    if(pollStatus === "Registration") {
        if (currentPoll.registeredVoters[userAddress]) {
            return "Registered";
        } else {
            return "CanRegister";
        }
    } else if(pollStatus === "Voting") {
        console.log("Poll State is voting");
        if (currentPoll.registeredVoters[userAddress]) {
            if (currentPoll.registeredVoters[userAddress].state === "Voted") {
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
    let calculated_stage;
    if (now < new Date(poll.registrationDeadline)) {
        calculated_stage =  "Registration";
    } else if (now < new Date(poll.votingDeadline)) {
        calculated_stage =  "Voting";
    } else {
        calculated_stage = "Ended";
    }

    // Overwrite calculated stage if stage on object is set to something else
    if (currentPoll?.currentStage) {
        return currentPoll?.currentStage;
    }
    return calculated_stage;
}

// Helper function to register a voter
function registerVoter(userAddress: string, registrationHash: string): number {
    if(!currentPoll) {
        throw new Error("No poll is currently active");
    }
    let id = currentPoll.currentId++;
    if(!currentPoll) {
        throw new Error("No poll is currently active");
    }
    currentPoll.registeredVoters[userAddress] = {
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
        throw new Error("No poll is currently active");
    }
    if(!currentPoll.registeredVoters[userAddress]) {
        throw new Error("User is not registered");
    }
    if(currentPoll.registeredVoters[userAddress].state === "Voted") {
        throw new Error("User has already voted");
    }
    if(currentPoll.registeredVoters[userAddress].id !== parseInt(id)) {
        throw new Error("Invalid id");
    }
    if(currentPoll.registeredVoters[userAddress].registrationHash !== signedHash) {
        throw new Error("Invalid registration hash");
    }
    if(vote !== "Yes" && vote !== "No") {
        throw new Error("Invalid vote");
    }
    if(getPollStatus(currentPoll) !== "Voting") {
        throw new Error("Poll is not in voting state");
    }
    if(vote === "Yes") {
        currentPoll.yesVotes++;
    } else {
        currentPoll.noVotes++;
    }
    console.log("CurrentPoll after vote: ", currentPoll);
    currentPoll.registeredVoters[userAddress].state = "Voted";
    currentPoll.registeredVoters[userAddress].voteHash = signedHash;
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

