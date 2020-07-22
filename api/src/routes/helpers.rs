/* Common Helpers */
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
struct Response {
	msg: String,
	code: i32,
	errors: Vec<String>
}

// Return an HTTP OK
pub fn http_ok(msg: String) -> impl warp::Reply {
	let res = Response {
		msg: msg,
		code: 200,
		errors: vec![],
	};

	return warp::reply::json(&res);
	// return warp::reply::with_status(msg, http::StatusCode::OK)
}

