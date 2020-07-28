table! {
    lists (id) {
        id -> Uuid,
        name -> Varchar,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

table! {
    todos (id) {
        id -> Uuid,
        title -> Varchar,
        body -> Text,
        completed -> Bool,
        archived -> Bool,
        todo_list_id -> Uuid,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

allow_tables_to_appear_in_same_query!(
    lists,
    todos,
);
