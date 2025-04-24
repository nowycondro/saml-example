# Using SAML with Azure Entra ID Example

## Prerequisite
- Put the `certificate.cer` in the same level as `index.js`.
- Update the `THE_ISSUER` with `Application (client) ID`, e.g. `7c5970e3-1111-2222-3333-something`.
- Update the `ENTRY_POINT` with `Location` value in `metadata.xml`, e.g. `https://login.microsoftonline.com/81fa766e-1111-2222-3333-something/saml2`.


### The example of `Location` in `metadata.xml`.
```xml
...
<SingleSignOnService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="https://login.microsoftonline.com/81fa766e-1111-2222-3333-something/saml2" />
...

```

## Install and Run
```bash
npm install
node index.js
```

## Check the Authentication
Open http://localhost:3000/
