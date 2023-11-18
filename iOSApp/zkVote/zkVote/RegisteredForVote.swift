//
//  RegisteredForVote.swift
//  zkVote
//
//  Created by Ümit Gül on 18.11.23.
//

import SwiftUI

struct RegisteredForVote: View {
    var body: some View {
        Text("You are eligible for a vote")
        
        Button(action: { registerVote() }, label: {
            Text("Register for vote")
        })
    }
    
    func registerVote() {
        print("muhaha")
    }
}

#Preview {
    RegisteredForVote()
}
