//
//  SignView.swift
//  zkVote
//
//  Created by Ümit Gül on 18.11.23.
//

import SwiftUI
import Combine
import metamask_ios_sdk
import Alamofire

@MainActor
struct SignView: View {
    @EnvironmentObject var metamaskSDK: MetaMaskSDK
    
    @State var message = ""
    @State var titleOfQuestion = ""
    @State var otherResponse: OtherResponse?
    @State var endedPollResponse: EndedPollResponse?
    @State var votedHash = ""
    @State var vote = ""

    
    @State private var showProgressView = false
    
    @State var result: String = ""
    @State private var errorMessage = ""
    @State private var showError = false
    
    private let signButtonTitle = "Sign"
    private static let appMetadata = AppMetadata(name: "Dub Dapp", url: "https://dubdapp.com")
    
    @State var state: StateEnum = .signToRegister
    
    enum StateEnum {
        case signToRegister
        case sendHTTPToRegister
        case registeredWaitingForOthers
        case youCanVote
        case hasVotedWaitingForResults
        case showTheEndResults
    }
    
    var body: some View {
        Form {
            switch state {
            case .signToRegister:
                Text(titleOfQuestion)
                Section(header: Text("Message")) {
                    Text(message)
                }
                Button {
                    Task {
                        await signInput()
                    }
                } label: {
                    Text(signButtonTitle)
                        .frame(maxWidth: .infinity, maxHeight: 32)
                }
                .alert(isPresented: $showError) {
                    Alert(
                        title: Text("Error"),
                        message: Text(errorMessage)
                    )
                }
            case .sendHTTPToRegister:
                Section(header: Text("Result")) {
                    Text(result)
                }
                Button {
                    showProgressView = true
                    registerVote()
                    state = .registeredWaitingForOthers
                } label: {
                    Text("Register Voting")
                }
            case .registeredWaitingForOthers:
                Section(header: Text("Result")) {
                    Text("You are registered. Waiting for the vote to start")
                }
                Button {
                    showProgressView = true
                    Task {
                        await getVoteStatus()
                    }
                } label: {
                    Text("Refresh")
                }
            case .youCanVote:
                Section(header: Text("Result")) {
                    Text("You can vote now!")
                }
                Button {
                    showProgressView = true
                    Task {
                        await signVote(yes: true)
                    }
                } label: {
                    Text("Sign Vote Yes")
                }
                Button {
                    showProgressView = true
                    Task {
                        await signVote(yes: false)
                    }
                } label: {
                    Text("Sign Vote No")
                }
            case .hasVotedWaitingForResults:
                Section(header: Text("Result")) {
                    Text("You voted \(vote). Waiting for the vote to end")
                }
                Button {
                    showProgressView = true
                    Task {
                        await getVoteStatus()
                    }
                } label: {
                    Text("Refresh")
                }
            case .showTheEndResults:
                Section(header: Text("Result")) {
                    Text("Yes votes: 3")
                    Text("No votes: 2")
                }
            }
        }
        .onAppear {
            showProgressView = true
            Task {
                await getVoteStatus()
                showProgressView = false
            }
        }
        .redacted(reason: showProgressView ? .placeholder : [])
    }
    
    func getVoteStatus() async {
        guard let url = URL(string: "http://172.18.9.145:3000/vote_status/\(metamaskSDK.account)") else { return }

        do {
            let request = AF.request(url)
            let data = try await request.serializingData().value

            // Try decoding the response to different types based on some condition
            if let pollResponse = try? decodePollResponse(from: data) {
                // Handle PollResponse
                print(pollResponse)
                message = pollResponse.hashToSign
                titleOfQuestion = pollResponse.pollQuestion
            } else if let otherResponse = try? decodeOtherResponse(from: data) {
                // Handle OtherResponse
                print(otherResponse)
                self.otherResponse = otherResponse
                state = .youCanVote
            } else if let endedPollResponse = try? decodeEndedPollResponse(from: data) {
                // Handle EndedPollResponse
                print(endedPollResponse)
                self.endedPollResponse = endedPollResponse
                state = .showTheEndResults
                // Add logic here to handle the ended poll response
            } else {
                // Fallback if no known type matches
                print("Unknown response format")
            }
            showProgressView = false
        } catch {
            print("Error during request or JSON decoding: \(error)")
        }
    }
    
    func decodePollResponse(from data: Data) throws -> PollResponse {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return try decoder.decode(PollResponse.self, from: data)
    }

    func decodeOtherResponse(from data: Data) throws -> OtherResponse {
        let decoder = JSONDecoder()
        return try decoder.decode(OtherResponse.self, from: data)
    }
    
    func decodeEndedPollResponse(from data: Data) throws -> EndedPollResponse {
        let decoder = JSONDecoder()
        return try decoder.decode(EndedPollResponse.self, from: data)
    }
    
    struct PollResponse: Decodable {
        struct Deadlines: Decodable {
            let registration: String
            let voting: String
        }
        
        let deadlines: Deadlines
        let hashToSign: String
        let pollQuestion: String
        let voteStatus: String
        
        enum CodingKeys: String, CodingKey {
            case deadlines
            case hashToSign = "hash_to_sign"
            case pollQuestion = "poll_question"
            case voteStatus = "vote_status"
        }
    }
    
    struct OtherResponse: Decodable {
        let voteStatus: String
        let pollQuestion: String
        let noHashToSign: String
        let yesHashToSign: String

        enum CodingKeys: String, CodingKey {
            case voteStatus = "vote_status"
            case pollQuestion = "poll_question"
            case noHashToSign = "no_hash_to_sign"
            case yesHashToSign = "yes_hash_to_sign"
        }
    }
    
    struct EndedPollResponse: Decodable {
        let voteStatus: String
        let pollQuestion: String
        let noVotes: Int
        let yesVotes: Int
        let deadlines: Deadlines

        enum CodingKeys: String, CodingKey {
            case voteStatus = "vote_status"
            case pollQuestion = "poll_question"
            case noVotes = "no_votes"
            case yesVotes = "yes_votes"
            case deadlines
        }

        struct Deadlines: Decodable {
            let registration: String
            let voting: String
        }
    }


    
    func signInput() async {
        let from = metamaskSDK.account
        let params: [String] = [from, message]
        let signRequest2 = EthereumRequest(
            method: .personalSign,
            params: params
        )
        print(signRequest2)
        
        showProgressView = true
        let requestResult = await metamaskSDK.request(signRequest2)
        showProgressView = false
        
        switch requestResult {
        case let .success(value):
            result = value
            errorMessage = ""
            state = .sendHTTPToRegister
        case let .failure(error):
            errorMessage = error.localizedDescription
            showError = true
        }
    }
    
    func registerVote() {
        guard let url = URL(string: "http://172.18.9.145:3000/register_voter/") else { return }
        
        struct Login: Encodable {
            let user_address: String
            let signed_hash: String
        }
        
        let login = Login(user_address: metamaskSDK.account, signed_hash: result)
        
        AF.request(url,
                   method: .post,
                   parameters: login,
                   encoder: JSONParameterEncoder.default).response { response in
            debugPrint(response)
        }
        showProgressView = false
    }
    
    // VOTE
    func signVote(yes: Bool) async {
        let from = metamaskSDK.account
        var params: [String] = []
        guard let response = otherResponse else { return }
        if yes {
            params = [from, response.yesHashToSign]
        } else {
            params = [from, response.noHashToSign]

        }
        let signRequest2 = EthereumRequest(
            method: .personalSign,
            params: params
        )
        
        showProgressView = true
        let requestResult = await metamaskSDK.request(signRequest2)
        showProgressView = false
        
        switch requestResult {
        case let .success(value):
            votedHash = value
            errorMessage = ""
            castVote()
        case let .failure(error):
            errorMessage = error.localizedDescription
            showError = true
        }
    }
    
    func castVote() {
        guard let url = URL(string: "http://172.18.9.145:3000/cast_vote/") else { return }
        
        struct CastVote: Encodable {
            let user_address: String
            let signed_hash: String
            let vote: String
            let id: String
        }
        
        let castVote = CastVote(user_address: metamaskSDK.account, signed_hash: result, vote: "Yes", id: "1")
        
        AF.request(url,
                   method: .post,
                   parameters: castVote,
                   encoder: JSONParameterEncoder.default).response { response in
            debugPrint(response)
        }
        state = .hasVotedWaitingForResults
        showProgressView = false
    }
    
    
}
