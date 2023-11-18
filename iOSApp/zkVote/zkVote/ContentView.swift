//
//  ContentView.swift
//  zkVote
//
//  Created by Ümit Gül on 18.11.23.
//

import SwiftUI
import Combine

struct ContentView: View {
    @ObservedObject private var connectionManager = ConnectionManager()
    @State private var cancellables: Set<AnyCancellable> = []
    @State private var isPresented = false
    var body: some View {
        VStack {
            Button(action: {
                connectionManager.ethereum.connect(connectionManager.dappMetamask)?.sink(receiveCompletion: { completion in
                    switch completion {
                    case let .failure(error):
                        print("Error connecting to Metamask: \(error.localizedDescription)")
                    default: break
                    }
                }, receiveValue: { result in
                    print("Metamask connection result: \(result)")
                    connectionManager.connectionType = .metamask
                    isPresented = true
                }).store(in: &cancellables)
            }) {
                Image("metamask")
                    .resizable()
                    .frame(width: 252, height: 80)
            }
            .padding()
        }
        .padding()
        .navigationDestination(isPresented: $isPresented) {
            Text("Connected")
        }
        .onReceive(NotificationCenter.default.publisher(for: .MetamaskConnection)) { notification in
            print(notification.userInfo?["value"] as? String ?? "Offline")
        }
    }
}
