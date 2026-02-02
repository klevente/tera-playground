use std::error::Error;
use wasm_bindgen::prelude::*;

#[wasm_bindgen(start)]
pub fn init() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub fn render_v1(template: &str, context_json: &str) -> Result<String, String> {
    let value: serde_json::Value =
        serde_json::from_str(context_json).map_err(|e| format!("Invalid JSON context: {e:?}"))?;

    let context =
        tera::Context::from_value(value).map_err(|e| format!("Invalid context: {e:?}"))?;

    tera::Tera::one_off(template, &context, false).map_err(|e| {
        if let Some(src_err) = e.source() {
            format!("Template error: {src_err}")
        } else {
            format!("Template error: {e}")
        }
    })
}

#[wasm_bindgen]
pub fn render_v2(template: &str, context_json: &str) -> Result<String, String> {
    let value: serde_json::Value =
        serde_json::from_str(context_json).map_err(|e| format!("Invalid JSON context: {e:?}"))?;

    let context =
        tera2::Context::from_serialize(&value).map_err(|e| format!("Invalid context: {e:?}"))?;

    tera2::Tera::one_off(template, &context, false).map_err(|e| {
        if let Some(src_err) = e.source() {
            format!("Template error: {src_err}")
        } else {
            format!("Template error: {e}")
        }
    })
}
