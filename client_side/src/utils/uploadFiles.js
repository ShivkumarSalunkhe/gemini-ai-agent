import axios from 'axios';

export const uploadFiles = async (files) => {
  try {
    const formData = new FormData();
    
    // Separate PDF and Excel files
    const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');
    const excelFiles = Array.from(files).filter(file => 
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel'
    );

    // Add files to form data
    pdfFiles.forEach(file => {
      formData.append('contract_files', file);
    });

    if (excelFiles.length >= 2) {
      formData.append('metadata_file', excelFiles[0]);
      formData.append('category_file', excelFiles[1]);
    } else {
      throw new Error('Please upload both metadata and category Excel files');
    }

    const response = await axios.post('http://localhost:8000/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true
    });

    return response.data;
  } catch (error) {
    throw error.response?.data?.detail || error.message;
  }
}; 