import { google } from 'googleapis'

const auth = new google.auth.GoogleAuth({
  keyFile: './src/connections/cred.json',
  scopes: 'https://www.googleapis.com/auth/spreadsheets',
})

const spreadsheetId = '1AFed1X05B8VtdnKX9o1ajSEjvn4-7fA92a8tQ7C7gpc'
const client = async () => {
  return await auth.getClient()
}

const googleSheets = google.sheets({
  version: 'v4',
  auth: client,
})

const getRows = async (table_name) => {
  const response = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: table_name,
  })

  return response
}

const appendData = async (table_name, values) => {
  try {
    googleSheets.spreadsheets.values.append({
      auth,
      spreadsheetId: spreadsheetId,
      range: table_name,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: values,
      },
    })
    return 'Ok'
  } catch (error) {
    return 'Error'
  }
}

const clearData = async (table_name) => {
  try {
    googleSheets.spreadsheets.values.clear({
      auth,
      spreadsheetId: spreadsheetId,
      range: `${table_name}`,
    })
    return 'Ok'
  } catch (error) {
    return 'Error'
  }
}

export { getRows, appendData, clearData }
