@Override
protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    // WebView security hardening
    WebView.setWebContentsDebuggingEnabled(false);
    WebSettings settings = webView.getSettings();
    settings.setAllowFileAccess(false);
    settings.setAllowFileAccessFromFileURLs(false);
    settings.setAllowUniversalAccessFromFileURLs(false);
    settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER);
    // Other WebView configuration...
}