use std::convert::Infallible;
use warp::{http, Rejection, Reply};
use serde::{Serialize};
use thiserror::Error;

// Custom errors
#[derive(Error, Debug)]
pub enum APIError {
	#[error("No results found with ID `{0}`")]
	NotFoundId(String),

	#[error("{0}")]
	GenericError(String),

	#[error(transparent)]
	UnknownError(#[from] anyhow::Error),
}
impl warp::reject::Reject for APIError {}

// Base error type
#[derive(Serialize)]
struct ErrorMessage {
	code: u16,
	message: String,
}

// Error handler
pub async fn handle_err(err: Rejection) -> Result<impl Reply, Infallible> {
	let code;
	let message;

	// 404
	if err.is_not_found() {
		code = http::StatusCode::NOT_FOUND;
		message = String::from("Page not found...");

	} else if let Some(api_error) = err.find::<APIError>() {
		match api_error {
			APIError::NotFoundId(_) => {
				code = http::StatusCode::BAD_REQUEST;
				message = api_error.to_string();
			},
			APIError::GenericError(_) => {
				code = http::StatusCode::INTERNAL_SERVER_ERROR;
				message = api_error.to_string();
			},
			APIError::UnknownError(e) => {
				eprintln!("Unknown Error: {}", e);
				code = http::StatusCode::INTERNAL_SERVER_ERROR;
				message = String::from("Unknown Error");
			}
		};

	// Bad data
	} else if let Some(deserialize_err) = err.find::<warp::filters::body::BodyDeserializeError>() {
		code = http::StatusCode::BAD_REQUEST;
		message = deserialize_err.to_string();
	
	// Bad method
	} else if let Some(_) = err.find::<warp::reject::MethodNotAllowed>() {
		code = http::StatusCode::BAD_REQUEST;
		message = String::from("Invalid request");

	// Other
	} else {
		eprintln!("Unhandled Rejection: {:?}", err);
		code = http::StatusCode::INTERNAL_SERVER_ERROR;
		message = String::from("Something went wrong");
	}

	let json = warp::reply::json(&ErrorMessage {
		code: code.as_u16(),
		message: message,
	});

	Ok(warp::reply::with_status(json, code))
}
