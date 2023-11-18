//
//  ContentView.swift
//  zkVote
//
//  Created by Ümit Gül on 18.11.23.
//

import SwiftUI
import Combine

import SwiftUI
import metamask_ios_sdk

extension Notification.Name {
    static let Event = Notification.Name("event")
    static let Connection = Notification.Name("connection")
}

@MainActor
struct ConnectView: View {
    @ObservedObject var metaMaskSDK = MetaMaskSDK.shared(appMetadata)

    private static let appMetadata = AppMetadata(name: "Dub Dapp", url: "https://dubdapp.com")

    @State private var connected: Bool = false
    @State private var status: String = "Offline"

    @State private var errorMessage = ""
    @State private var showError = false
    
    @State private var connectAndSignResult = ""
    @State private var isConnect = true
    @State private var isConnectAndSign = false

    @State private var showProgressView = false

    var body: some View {
        NavigationView {
            List {
                Section {
                    Group {
                        HStack {
                            Text("Status")
                                .bold()
                            Spacer()
                            Text(status)
                        }

                        HStack {
                            Text("Chain ID")
                                .bold()
                            Spacer()
                            Text(metaMaskSDK.chainId)
                        }

                        HStack {
                            Text("Account")
                                .bold()
                            Spacer()
                            Text(metaMaskSDK.account)
                        }
                    }
                }

                if !metaMaskSDK.account.isEmpty {
                    Section {
                        Group {
                            NavigationLink("Sign") {
                                SignView().environmentObject(metaMaskSDK)
                            }
                        }
                    }
                }

                if metaMaskSDK.account.isEmpty {
                    Section {
                        ZStack {
                            Button {
                                Task {
                                    await connectSDK()
                                }
                            } label: {
                                Text("Connect to MetaMask")
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
                    } footer: {
                        Text(connectAndSignResult)
                    }
                }
                
                if !metaMaskSDK.account.isEmpty {
                    Section {
                        Button {
                            metaMaskSDK.clearSession()
                        } label: {
                            Text("Clear Session")
                                .frame(maxWidth: .infinity, maxHeight: 32)
                        }
                        
                        Button {
                            metaMaskSDK.disconnect()
                        } label: {
                            Text("Disconnect")
                                .frame(maxWidth: .infinity, maxHeight: 32)
                        }
                    }
                }
            }
            .font(.body)
            .onReceive(NotificationCenter.default.publisher(for: .Connection)) { notification in
                status = notification.userInfo?["value"] as? String ?? "Offline"
            }
            .navigationTitle("Dub Dapp")
            .onAppear {
                showProgressView = false
            }
        }
    }
    
    func connectSDK() async {
        showProgressView = true
        let result = await metaMaskSDK.connect()
        showProgressView = false
        
        switch result {
        case let .failure(error):
            errorMessage = error.localizedDescription
            showError = true
        default:
            break
        }
    }
}

struct ConnectView_Previews: PreviewProvider {
    static var previews: some View {
        ConnectView()
    }
}
