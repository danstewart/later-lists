use warp::{Filter, Reply, reject, filters::BoxedFilter};
use serde::{Deserialize, Serialize};
use anyhow::{Result};
use super::helpers::{http_ok};

use crate::models::{
	helpers::Model,
	lists::TodoList,
};

/*
* Data structures
*/
#[derive(Debug, Deserialize, Serialize, Clone)]
struct ListRequest {
	id: Option<uuid::Uuid>,
	name: String,
}

impl ListRequest {
	fn into_todo_list(&self) -> TodoList {
		let uuid = match self.id {
			Some(id) => id,
			None     => uuid::Uuid::new_v4()
		};

		TodoList {
			id: uuid,
			name: self.name.clone(),
			created_at: chrono::Utc::now().naive_utc(),
			updated_at: chrono::Utc::now().naive_utc(),
		}
	}
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct ListResponse {
	id: uuid::Uuid,
	name: String,
	created_at: chrono::NaiveDateTime,
	updated_at: chrono::NaiveDateTime,
}

impl ListResponse {
	fn from_list(list: TodoList) -> Self {
		ListResponse {
			id: list.id,
			name: list.name,
			created_at: list.created_at,
			updated_at: list.updated_at,
		}
	}
}

/*
* Routes
*/
pub async fn load_routes() -> BoxedFilter<(impl Reply,)> {
	// PUT: /api/list
	let add = warp::put()
		.and(warp::path("api"))
		.and(warp::path("lists"))
		.and(warp::path::end())
		.and(json_body())
		.and_then(add_todo);

	// GET: /api/list/:id
	let get = warp::get()
		.and(warp::path("api"))
		.and(warp::path("lists"))
		.and(warp::path::param::<uuid::Uuid>())
		.and(warp::path::end())
		.and_then(get_todo);

	// GET: /api/list
	let all = warp::get()
		.and(warp::path("api"))
		.and(warp::path("lists"))
		.and(warp::path::end())
		.and_then(get_all_todos);

	// POST: /api/list/:id
	let update = warp::post()
		.and(warp::path("api"))
		.and(warp::path("lists"))
		.and(warp::path::param::<uuid::Uuid>())
		.and(warp::path::end())
		.and(json_body())
		.and_then(update_todo);

	// Return the routes
	add.or(get).or(all).or(update).boxed()
}

// GET /api/todo/3
async fn get_todo(id: uuid::Uuid) -> Result<impl warp::Reply, warp::Rejection> {
	let list = match TodoList::find(id).await {
		Ok (list) => list,
		Err(e)    => return Err(reject::custom(e)),
	};

	let response = ListResponse::from_list(list);
	Ok(warp::reply::json(&response))
}

// GET /api/todo
async fn get_all_todos() -> Result<impl warp::Reply, warp::Rejection> {
	let todos = match TodoList::all(None).await {
		Ok (todos) => todos,
		Err(e)     => return Err(reject::custom(e)),
	};

	Ok(warp::reply::json(&todos))
}

// PUT /api/todo
async fn add_todo(request: ListRequest) -> Result<impl warp::Reply, warp::Rejection> {
	let list = request.into_todo_list();

	match list.create().await {
		Ok(id) => Ok(http_ok(
			format!("Created list `{}`", request.name),
			id,
		)),
		Err(e) => Err(reject::custom(e)),
	}
}

// POST /api/todo/3
async fn update_todo(id: uuid::Uuid, mut request: ListRequest) -> Result<impl warp::Reply, warp::Rejection> {
	request.id = Some(id);
	let list = request.into_todo_list();

	match list.save().await {
		Ok (_) => Ok(http_ok(
			format!("Updated list '{}'", list.name),
			list.id,
		)),
		Err(e) => Err(reject::custom(e)),
	}

}

/*
* Helpers
*/
// Parse json req body
fn json_body() -> impl Filter<Extract = (ListRequest,), Error = warp::Rejection> + Clone {
	warp::body::content_length_limit(1024 * 16).and(warp::body::json())
}

