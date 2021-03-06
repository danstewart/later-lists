
use std::collections::HashMap;
use std::sync::{
	atomic::{AtomicUsize, Ordering},
	Arc,
};
use warp::ws::{Message, WebSocket};
use warp::{Filter, Reply, filters::BoxedFilter};
use futures::{FutureExt, StreamExt};
use tokio::sync::{mpsc, RwLock};

/// Our global unique user id counter.
static NEXT_USER_ID: AtomicUsize = AtomicUsize::new(1);

/// Our state of currently connected users.
/// - Key is their id
/// - Value is a sender of `warp::ws::Message`
type Users = Arc<RwLock<HashMap<usize, mpsc::UnboundedSender<Result<Message, warp::Error>>>>>;

pub async fn load_routes() -> BoxedFilter<(impl Reply,)> {
	let users = Users::default();

	// Turn our "state" into a new Filter...
	let users = warp::any().map(move || users.clone());

	let chat = warp::path("chat")
		.and(warp::ws())
		.and(users)
		.map(|ws: warp::ws::Ws, users| {
			ws.on_upgrade(move |socket| user_connected(socket, users)
		)
	});

	return chat.boxed();
}

async fn user_connected(ws: WebSocket, users: Users) {
	// Use a counter to assign a new unique ID for this user.
	let my_id = NEXT_USER_ID.fetch_add(1, Ordering::Relaxed);

	// Split the socket into a sender and receive of messages.
	let (user_ws_tx, mut user_ws_rx) = ws.split();


	// Use an unbounded channel to handle buffering and flushing of messages
	// to the websocket...
	let (tx, rx) = mpsc::unbounded_channel();
	tokio::task::spawn(rx.forward(user_ws_tx).map(|result| {
		if let Err(e) = result {
			eprintln!("websocket send error: {}", e);
		}
	}));

	// Save the sender in our list of connected users.
	users.write().await.insert(my_id, tx);

	// Return a `Future` that is basically a state machine managing
	// this specific user's connection.

	// Make an extra clone to give to our disconnection handler...
	let users2 = users.clone();

	
	// Every time the user sends a message, broadcast it to
	// all other users...
	while let Some(result) = user_ws_rx.next().await {
		let msg = match result {
			Ok(msg) => msg,
			Err(e) => {
				eprintln!("websocket error(uid={}): {}", my_id, e);
				break;
			}
		};
		user_message(my_id, msg, &users).await;
	}

	// user_ws_rx stream will keep processing as long as the user stays
	// connected. Once they disconnect, then...
	user_disconnected(my_id, &users2).await;
}

async fn user_message(my_id: usize, msg: Message, users: &Users) {
	// Skip any non-Text messages...
	let msg = if let Ok(s) = msg.to_str() {
		s
	} else {
		return;
	};

	let new_msg = format!("<User#{}>: {}", my_id, msg);

	// New message from this user, send it to everyone else (except same uid)...
	for (&uid, tx) in users.read().await.iter() {
		eprintln!("SENDING {} to {}", msg, uid);
		if my_id != uid {
			if let Err(_disconnected) = tx.send(Ok(Message::text(new_msg.clone()))) {
				// The tx is disconnected, our `user_disconnected` code
				// should be happening in another task, nothing more to
				// do here.
			}
		}
	}
}

async fn user_disconnected(my_id: usize, users: &Users) {
	eprintln!("good bye user: {}", my_id);

	// Stream closed up, so remove from the user list
	users.write().await.remove(&my_id);
}
