import express, { Request, Response } from 'express';

const app = express();
app.use(express.json());

// Mock data for storing registered voters and votes
let registeredVoters: { [key: string]: string } = {};
let castVotes: { [key: string]: { vote: string, id: string } } = {};

// API endpoint to get vote status
app.get('/vote_status/:user_address', (req: Request, res: Response) => {
    const userAddress = req.params.user_address;
    const voteStatus = getVoteStatus(userAddress);

    // Replace this with your actual logic to get the deadline for each stage
    const deadlineForEachStage = getDeadlineForStage();

    res.json({
        vote_status: voteStatus,
        deadline_for_each_stage: deadlineForEachStage,
    });
});

// API endpoint to register a voter
app.post('/register_voter', (req: Request, res: Response) => {
    const { user_address, signed_hash } = req.body;
    const result = registerVoter(user_address, signed_hash);

    res.json(result);
});

// API endpoint to cast a vote
app.post('/cast_vote', (req: Request, res: Response) => {
    const { user_address, signed_hash, vote, id } = req.body;
    const result = castVote(user_address, signed_hash, vote, id);

    res.json(result);
});

// Helper function to get vote status
function getVoteStatus(userAddress: string): string {
    // Replace this with your actual logic to determine the vote status
    // You can use the registeredVoters and castVotes data structures to check the status
    // and deadlines for each stage.
    return "None";
}

// Helper function to register a voter
function registerVoter(userAddress: string, signedHash: string): { Id: string, Ok: string } {
    // Replace this with your actual logic to register a voter
    registeredVoters[userAddress] = signedHash;

    // Generate a unique ID for the registration (replace with your logic)
    const registrationId = generateUniqueId();

    return { Id: registrationId, Ok: "Registration successful" };
}

// Helper function to cast a vote
function castVote(userAddress: string, signedHash: string, vote: string, id: string): { Ok?: string, Err?: string } {
    // Replace this with your actual logic to cast a vote
    // Check if the user is registered and if the vote has not been cast before
    if (registeredVoters[userAddress] && !castVotes[id]) {
        castVotes[id] = { vote, id };
        return { Ok: "Vote cast successfully" };
    } else {
        return { Err: "Error casting vote" };
    }
}

// Helper function to get the deadline for each stage
function getDeadlineForStage(): string {
    // Replace this with your actual logic to determine the deadline for each stage
    // You can use the current date/time and add a certain duration for each stage.
    return "2023-12-31T23:59:59";
}

// Helper function to generate a unique ID (replace with your logic)
function generateUniqueId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

