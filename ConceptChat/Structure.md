# Structure of Chat Application

### Input / Output / Rules

We have following gates:
- User
- User Interface
- Rules (Simplified for this application)
- User Graph
- Committed Graph
- Gun Transport to other peers

### User Story / Interaction

User needs to create a login or login with his existing alias and passphrase.
Once logged in, there should be a public chat room. (aka Lobby) Represents unencrypted data in free space.
From there he can start an End-to-End Encrypted Conversation with another user.
Or start a group with multiple users.
He/She can chat away without having to worry about getting spied on. (Unless the users machine is compromised itself)

### Behind the Curtain

Upon login, the rules are downloaded to local memory and cached. (Cache gets updated every time we update a rule via gun.on)
The login event starts a query for the main view.

_View Lobby, at time 6234 from user alias1_

We are checking if any rule fits. Rule,
_when lobby is called, do this_ (Function Execution that runs a query with time sort on all records in lobby...)

User asks for chat with User alias2

_Start Conversation with User:alias2 type endToEnd_

Creating both users now create a new room context (shared data), each chat message by one user is encrypted with the others public key. (We might need to save our messages encrypted with our own key as well.)

Rule _Conversation Start_ is triggered which creates these on each of the clients

(Create a p2p event system, with listeners for specific graphs, like push notification that we can eval on other users inference for notification/control)
