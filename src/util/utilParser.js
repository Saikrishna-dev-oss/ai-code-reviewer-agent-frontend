// src/util/utilParser.js
import JSZip from 'jszip';

/**
 * Helper function to determine the architectural category of a file based on its extension.
 */
const categorizeFile = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();

  switch (ext) {
    case 'jsx':
    case 'tsx':
      return 'UI Component';
    case 'js':
    case 'ts':
      return 'Frontend Logic';
    case 'py':
    case 'java':
    case 'rb':
    case 'go':
      return 'Backend Script';
    case 'css':
    case 'scss':
      return 'Stylesheet';
    case 'sql':
    case 'json':
    case 'yaml':
    case 'yml':
      return 'Config & Data';
    case 'html':
      return 'Markup';
    case 'md':
      return 'Documentation';
    default:
      return 'Other Source File';
  }
};

/**
 * Extracts raw text code from a given file (.zip or single source file).
 * Returns a Promise that resolves to an array: [{ fileName, code, category }]
 */
export const extractCodeFiles = async (file) => {
  if (!file) throw new Error("No file provided.");

  if (file.name.endsWith('.zip')) {
    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(file);
    const fileDataList = [];
    const promises = [];

    loadedZip.forEach((relativePath, zipEntry) => {
      if (!zipEntry.dir && !relativePath.startsWith('__MACOSX') && !relativePath.includes('/.')) {
        const promise = zipEntry.async("string").then((content) => {
          fileDataList.push({
            fileName: relativePath,
            code: content,
            category: categorizeFile(relativePath) // <-- Injecting the category tag here!
          });
        });
        promises.push(promise);
      }
    });

    await Promise.all(promises);
    return fileDataList;
  }

  if (file.name.match(/\.(py|js|jsx|sql|css|json)$/)) {
    const content = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (err) => reject(err);
      reader.readAsText(file);
    });
    
    return [{ 
      fileName: file.name, 
      code: content,
      category: categorizeFile(file.name) // <-- Injecting the category tag here!
    }];
  }

  throw new Error('Unsupported file type. Please upload a .zip or source code file.');
};