/* Common Helpers */
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
struct Response {
	message: String,
	code: i32,
}

// Return an HTTP OK
pub fn http_ok(msg: String) -> impl warp::Reply {
	let res = Response {
		message: msg,
		code: 200,
	};

	return warp::reply::json(&res);
}

