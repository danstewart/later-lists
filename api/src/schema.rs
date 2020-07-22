table! {
	todos (id) {
		id -> Nullable<Int4>, // Hack this to be nullable so we can use one struct
		title -> Varchar,
		body -> Text,
		completed -> Bool,
		archived -> Bool,
		created -> Timestamp,
	}
}
