//
//  SignView.swift
//  zkVote
//
//  Created by Ümit Gül on 18.11.23.
//

import SwiftUI
import Combine
import metamask_ios_sdk

@MainActor
struct SignView: View {
    @EnvironmentObject var metamaskSDK: MetaMaskSDK

    @State var message = ""
    @State private var showProgressView = false

    @State var result: String = ""
    @State private var errorMessage = ""
    @State private var showError = false
    
    private let signButtonTitle = "Sign"
    private let connectAndSignButtonTitle = "Connect & Sign"
    private static let appMetadata = AppMetadata(name: "Dub Dapp", url: "https://dubdapp.com")

    var body: some View {
        GeometryReader { geometry in
            Form {
                Section {
                    Text("Message")
                    TextEditor(text: $message)
                        .frame(height: geometry.size.height / 2)
                }

                Section {
                    Text("Result")
                    TextEditor(text: $result)
                        .frame(minHeight: 40)
                }

                Section {
                    ZStack {
                        Button {
                            Task {
                                await signInput()
                            }
                        } label: {
                            Text(signButtonTitle)
                                .frame(maxWidth: .infinity, maxHeight: 32)
                        }
                        
                        if showProgressView {
                            ProgressView()
                                .scaleEffect(1.5, anchor: .center)
                                .progressViewStyle(CircularProgressViewStyle(tint: .black))
                        }
                    }
                    .alert(isPresented: $showError) {
                        Alert(
                            title: Text("Error"),
                            message: Text(errorMessage)
                        )
                    }
                }
            }
        }
        .onAppear {
            Task {
                await getVoteStatus(userAddress: "0xd5fD5b9427FBCbA41339904E26a9649b813781C4")
                showProgressView = false
            }

        }
    }
    
    func getVoteStatus(userAddress: String) async {
        guard let url = URL(string: "http://172.18.9.145:3000/vote_status/\(userAddress)") else { return }
        var request = URLRequest(url: url)
    
        let (data, response) = try! await URLSession.shared.data(for: request)
        print("response: \(response)")
            print("data: \(data)")
        let jsonDecoder = JSONDecoder()
        
        let responseJSON = try? JSONSerialization.jsonObject(with: data, options: [])
        print("responseJSON \(responseJSON)")
        
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        do {
           let pollResponse = try decoder.decode(PollResponse.self, from: data)
           print(pollResponse)
            message = pollResponse.hashToSign
        } catch {
           print("Error decoding JSON: \(error)")
        }


            // Handle response, data, and error
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

    func signInput() async {
        let from = metamaskSDK.account
        let params: [String] = [from, message]
        let signRequest2 = EthereumRequest(
            method: .personalSign,
            params: params
        )
//        let signRequest = EthereumRequest(
//            method: .ethSignTypedDataV4,
//            params: params
//        )
        
        showProgressView = true
        let requestResult = await metamaskSDK.request(signRequest2)
        showProgressView = false
        
        switch requestResult {
        case let .success(value):
            result = value
            errorMessage = ""
        case let .failure(error):
            errorMessage = error.localizedDescription
            showError = true
        }
    }
    
    func connectAndSign() async {
        showProgressView = true
        let connectSignResult = await metamaskSDK.connectAndSign(message: message)
        showProgressView = false
        
        switch connectSignResult {
        case let .success(value):
            result = value
            errorMessage = ""
        case let .failure(error):
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}

struct SignView_Previews: PreviewProvider {
    static var previews: some View {
        SignView()
    }
}
