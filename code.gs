// Your root Google Drive folder ID where all subjects will be stored
const ROOT_FOLDER_ID = '1EFX9aylAeSRmDWU7OeFIPa0llAMD8wC5';

/**
 * 1. SERVE THE WEB APP
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
      .setTitle('Presentation to PDF Reviewer')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * 2. GET SUBJECTS (FOLDERS)
 */
function getSubjects() {
  try {
    const rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
    const folders = rootFolder.getFolders();
    const subjects = [];
    
    while (folders.hasNext()) {
      const folder = folders.next();
      subjects.push({
        id: folder.getId(),
        name: folder.getName()
      });
    }
    
    subjects.sort((a, b) => a.name.localeCompare(b.name));
    return { success: true, data: subjects };
  } catch (error) {
    return { success: false, error: 'Could not load subjects: ' + error.toString() };
  }
}

/**
 * 3. CREATE A NEW SUBJECT FOLDER
 */
function createSubjectFolder(subjectName) {
  try {
    const rootFolder = DriveApp.getFolderById(ROOT_FOLDER_ID);
    const existingFolders = rootFolder.getFoldersByName(subjectName);
    
    if (existingFolders.hasNext()) {
      const folder = existingFolders.next();
      return { success: true, data: { id: folder.getId(), name: folder.getName() } };
    }
    
    const newFolder = rootFolder.createFolder(subjectName);
    return { success: true, data: { id: newFolder.getId(), name: newFolder.getName() } };
    
  } catch (error) {
    return { success: false, error: 'Could not create folder: ' + error.toString() };
  }
}

/**
 * 4. SAVE THE PDF TO DRIVE
 */
function savePdfToDrive(base64Data, filename, targetFolderId) {
  try {
    let finalName = filename;
    if (!finalName.toLowerCase().endsWith('.pdf')) {
      finalName += '.pdf';
    }

    const base64String = base64Data.split(',')[1] || base64Data;
    const decodedData = Utilities.base64Decode(base64String);
    const blob = Utilities.newBlob(decodedData, MimeType.PDF, finalName);
    
    const folderIdToUse = targetFolderId || ROOT_FOLDER_ID;
    const folder = DriveApp.getFolderById(folderIdToUse);
    const file = folder.createFile(blob);
    
    return { success: true, url: file.getUrl() };
    
  } catch (error) {
    return { success: false, error: error.toString() };
  }
}
