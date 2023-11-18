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
            updateMessage()
            showProgressView = false
        }
        .onChange(of: metamaskSDK.chainId) { _ in
            updateMessage()
        }
    }
    
    func updateMessage() {
        message = "0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0"
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
