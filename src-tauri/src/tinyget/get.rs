/// Get softwares' list
/// Use in search / list operations
use serde::Serialize;

use crate::tinyget_grpc::{
    tinyget_grpc_client::TinygetGrpcClient, SoftsResquest,
};

use log::error;

#[derive(Default, Serialize)]
pub struct Software {
    package_name: String,
    architecture: String,
    description: String,
    version: String,
    installed: bool,
    automatically_installed: bool,
    upgradable: bool,
    available_version: Option<String>,
    repo: Vec<String>,
}

/// get software list
#[tauri::command]
pub async fn list(
    only_installed: bool,
    only_upgradable: bool,
    pkgs: String,
) -> Result<Vec<Software>, String> {
    let mut client = match TinygetGrpcClient::connect("http://[::]:5051").await
    {
        Ok(client) => client,
        Err(e) => {
            // logger output error
            let es = e.to_string();
            error!("tinyget error: {}", &es);
            return Err(es);
        }
    };

    let resq = tonic::Request::new(SoftsResquest {
        pkgs: if pkgs.is_empty() { None } else { Some(pkgs) },
        only_installed,
        only_upgradable,
    });
    let mut stream_softs = match client.softs_get_stream(resq).await {
        Ok(resp) => resp,
        Err(e) => {
            // logger output error
            let es = e.to_string();
            error!("tinyget error: {}", &es);
            return Err(es);
        }
    }
    .into_inner();
    let mut ret_softs = vec![];
    while let Some(s) = match stream_softs.message().await {
        Ok(x) => x,
        Err(e) => {
            // logger output error
            let es = e.to_string();
            error!("tinyget error: {}", &es);
            return Err(es);
        }
    } {
        ret_softs.push(Software {
            package_name: s.package_name.to_string(),
            architecture: s.architecture.to_string(),
            description: s.description.to_string(),
            version: s.version.to_string(),
            installed: s.installed,
            automatically_installed: s.automatically_installed,
            upgradable: s.upgradable,
            available_version: s.available_version.clone(),
            repo: s.repo.clone(),
        });
    }
    Ok(ret_softs)
}
