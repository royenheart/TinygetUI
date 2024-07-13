use std::collections::HashMap;

use serde::{de, Serialize};

#[derive(Default, Serialize)]
pub struct Software {
    name: String,
    /// current version
    curr_version: String,
    latest_version: String,
    curr_size: f64,
    latest_size: f64,
    depends: Option<HashMap<String, Software>>,
    author: Option<String>,
    /// brief description
    brief: Option<String>,
    /// descpription
    desc: Option<String>,
    /// from which package source
    source: String,
    copyright: Option<String>,
    homepage: Option<String>,
    userguide: Option<String>,
    reportbug: Option<String>,
}

/// get software list
///
/// - `cached`: use cached softs previously queried, default or none is false
/// - `flush`: update the sources of softs, default or none is false
#[tauri::command]
pub fn softs(
    cached: Option<bool>,
    flush: Option<bool>,
) -> Result<Vec<Software>, String> {
    let mut dep1 = HashMap::new();
    dep1.insert("Test1".to_string(), Software::default());
    let mut dep2 = HashMap::new();
    dep2.insert("Test2".to_string(), Software::default());
    Ok(vec![
        Software {
            name: "Test1".to_string(),
            curr_version: "2.3".to_string(),
            latest_version: "2.4".to_string(),
            curr_size: 33.0,
            latest_size: 44.0,
            depends: Some(dep1),
            author: Some("nihao".to_string()),
            brief: Some("A test application".to_string()),
            desc: Some("It's a wonderful text".to_string()),
            source: "https://baidu.com".to_string(),
            copyright: Some("MIT License".to_string()),
            homepage: Some("https://google.com".to_string()),
            userguide: Some("https://x.com".to_string()),
            reportbug: Some("https://youtube.com".to_string()),
        },
        Software {
            name: "Test2".to_string(),
            curr_version: "3.4".to_string(),
            latest_version: "3.6".to_string(),
            curr_size: 10000.2,
            latest_size: 10.2,
            depends: Some(dep2),
            author: Some("ME".to_string()),
            brief: Some("A test1 application".to_string()),
            desc: Some("It's a wonderful text".to_string()),
            source: "https://baidu.com".to_string(),
            copyright: Some("MIT License".to_string()),
            homepage: Some("https://google.com".to_string()),
            userguide: Some("https://x.com".to_string()),
            reportbug: Some("https://youtube.com".to_string()),
        },
    ])
}
