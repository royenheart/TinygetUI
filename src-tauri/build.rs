use std::io::Result;
fn main() -> Result<()> {
    tonic_build::configure()
        .build_client(true)
        .build_server(false)
        .out_dir("protos")
        .compile(&["protos/tinyget_grpc.proto"], &["protos"])?;
    tauri_build::build();
    Ok(())
}
