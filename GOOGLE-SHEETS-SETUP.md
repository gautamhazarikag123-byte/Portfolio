# Google Sheets setup

The current web-app URL responds, but its POST request returns an error.
Replace it with `google-apps-script.gs`, run `setup()` once, and deploy
a new version.

1. Open the Google Sheet that should receive the enquiries.
2. Open **Extensions > Apps Script** from that Sheet.
3. Delete the old Apps Script and paste all code from
   `google-apps-script.gs`.
4. Click **Save**.
5. Select `setup` from the function menu and click **Run** once.
6. Approve the requested Google permissions.
7. Confirm the execution log says it connected to your Sheet.
8. Select `testSubmission` and click **Run** once.
9. Confirm a `Test Client` row appears in the `Leads` sheet.
10. Do not run `doPost` manually; it only runs from the website.
11. Choose **Deploy > Manage deployments**.
12. Edit the existing web-app deployment and choose **New version**.
13. Set **Execute as** to **Me**.
14. Set **Who has access** to **Anyone**.
15. Click **Deploy**.
16. Keep using the same `/exec` URL already present in `js/script.js`.

Submit one test form. A sheet named `Leads` will be created automatically.

When uploading the website, upload the complete folder together. Do not
upload only `thank-you.html`; it requires the new `css/style.css` and
`js/script.js` files included in this package.
