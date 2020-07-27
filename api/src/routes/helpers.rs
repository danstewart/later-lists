/* Common Helpers */
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
struct Response {
	id: uuid::Uuid,
	message: String,
	code: i32,
}

// Return an HTTP OK
pub fn http_ok(msg: String, id: uuid::Uuid) -> impl warp::Reply {
	let res = Response {
		id: id,
		message: msg,
		code: 200,
	};

	return warp::reply::json(&res);
}

