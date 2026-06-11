/**
 * Web App Endpoint: Version 14 (With Native Checkbox Layout Insertion)
 */
function doPost(e) {
  var output = ContentService.createTextOutput("OK");
  
  try {
    var rawJsonText = e.postData.contents;
    var dudaData = JSON.parse(rawJsonText);
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Drop Spots List"); 
    if (!sheet) return output;
    
    // 1. EXACT KEY MATCHING FROM DUDA
    var binId = dudaData["Bin ID:"] || dudaData["Bin ID"] || dudaData["bin_id"] || "";
    var centerName = dudaData["Shopping Center Name:"] || dudaData["Shopping Center Name"] || dudaData["shopping_center_name"] || "";
    var street = dudaData["Street Address"] || dudaData["street_address"] || "";
    var city = dudaData["City:"] || dudaData["City"] || dudaData["city"] || "";
    var state = dudaData["State:"] || dudaData["State"] || dudaData["state"] || "";
    var locationLink = dudaData["Location Link"] || dudaData["location_link"] || "";
    
    // 🛑 GHOST LOOP BLOCKER
    var blockedTestValues = ["3213213213", "123456", ""]; 
    if (blockedTestValues.indexOf(binId) !== -1 || binId.toString().trim() === "") {
      return output; 
    }
    
    var nextRow = sheet.getLastRow() + 1;
    
    // 🔍 SCAN COLUMN C: Find the closest row above that has a real Bin ID
    var backupSourceRow = nextRow - 1; 
    for (var i = nextRow - 1; i > 1; i--) {
      var binCheck = sheet.getRange("C" + i).getValue();
      if (binCheck !== null && binCheck !== "") {
        backupSourceRow = i;
        break; 
      }
    }
    
    // 2. Write Web Input Data to proper columns
    sheet.getRange("C" + nextRow).setValue("'" + binId);
    sheet.getRange("D" + nextRow).setValue(centerName);
    sheet.getRange("G" + nextRow).setValue(street);
    sheet.getRange("H" + nextRow).setValue(city);
    sheet.getRange("I" + nextRow).setValue(state);
    sheet.getRange("J" + nextRow).setValue(locationLink);
    
    // 3. Transfer static data from the verified backupSourceRow (K through O)
    // A) Clone Column F on its own (preserving your input fields in G, H, I, J)
    var staticF = sheet.getRange("F" + backupSourceRow).getValue();
    sheet.getRange("F" + nextRow).setValue(staticF);
    
    // B) Clone your standard block (K through O) exactly like before
    var staticValues = sheet.getRange("K" + backupSourceRow + ":O" + backupSourceRow).getValues();
    sheet.getRange("K" + nextRow + ":O" + nextRow).setValues(staticValues);
    
    // 4. Inject Dynamic Formulas character-for-character
    var formulaU = '="https://www.clothingdropspot.com/qr-signups?bin_id=" & C' + nextRow + ' & "&location_name=" & SUBSTITUTE(D' + nextRow + ', " ", "+") & "&city_state=" & SUBSTITUTE(H' + nextRow + ', " ", "+") & ",+" & I' + nextRow;
    var formulaV = '="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" & ENCODEURL(U' + nextRow + ')';
    sheet.getRange("U" + nextRow).setFormula(formulaU);
    sheet.getRange("V" + nextRow).setFormula(formulaV);
    
    // 5. 🛠️ THE INTERACTIVE CHECKBOX FIX:
    // This injects an official, clickable Google Checkbox widget directly into Column W (Column 23)
    var checkboxCell = sheet.getRange("W" + nextRow);
    checkboxCell.insertCheckboxes(); 
    checkboxCell.setValue(true); // Turn it on instantly to kick off the automation pipeline
    
    // 🔀 CRITICAL ENGINE FLUSH
    SpreadsheetApp.flush();
    Utilities.sleep(1000); 
    
    // 6. Run QR/PDF generation for this row immediately
    if (typeof generateQRForRow === "function") {
       generateQRForRow(nextRow);
    }
    
    // Save raw metadata logging strings
    sheet.getRange("Z1").setValue(rawJsonText);
    sheet.getRange("Z2").setValue("Success - Automation Complete"); 
    
  } catch (error) {
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Drop Spots List").getRange("Z2").setValue(error.toString());
  }
  
  return output;
}
