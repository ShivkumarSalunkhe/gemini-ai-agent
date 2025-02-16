import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { uploadFiles } from '../utils/uploadFiles';

export const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const { logout } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(() => 
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setSidebarOpen(width >= 768);
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files.length) return;

    setUploading(true);
    setUploadError('');

    try {
      await uploadFiles(files);
      // Add new files to the uploadedFiles state
      const newFiles = Array.from(files).map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type
      }));
      setUploadedFiles(prev => {
        const updatedFiles = [...prev, ...newFiles];
        return updatedFiles;
      });
      event.target.value = null;
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.toString());
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col w-full">
      <div className="flex-shrink-0 px-4 py-4 border-b border-border">
        <h2 className="text-xl font-semibold text-foreground">Document Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* File upload section */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Upload Documents</h3>
          <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
            <input
              type="file"
              className="hidden"
              id="file-upload"
              multiple
              accept=".pdf,.xlsx"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <label
              htmlFor="file-upload"
              className={`cursor-pointer inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors ${
                uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {uploading ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Uploading...</span>
                </div>
              ) : (
                'Choose files'
              )}
            </label>
            <p className="mt-2 text-sm text-muted-foreground">
              PDF & XLSX files supported
            </p>
            {uploadError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-sm text-destructive"
              >
                {uploadError}
              </motion.p>
            )}
          </div>

          {/* Uploaded files list */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Uploaded Files</h3>
              <div className="space-y-2 max-h-[calc(100vh-24rem)] overflow-y-auto">
                {uploadedFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center justify-between p-2 bg-card/50 rounded-md group hover:bg-card"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <span className="text-sm truncate">{file.name}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveFile(file.id)}
                      className="ml-2 p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 rounded transition-all"
                      title="Remove file"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 p-4 border-t border-border mt-auto space-y-2">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium bg-muted/50 hover:bg-muted text-foreground rounded-md transition-colors"
        >
          <div className="flex items-center space-x-2">
            {isDarkMode ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            )}
            <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
        </button>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-md transition-colors"
        >
          <div className="flex items-center space-x-2">
            <svg 
              className="w-4 h-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
              />
            </svg>
            <span>Logout</span>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Single Sidebar */}
      <AnimatePresence>
        <motion.aside
          initial={false}
          animate={{
            x: sidebarOpen ? 0 : '-100%',
            position: windowWidth >= 768 ? 'relative' : 'fixed'
          }}
          className="w-72 h-screen bg-card border-r border-border z-30 inset-y-0 left-0"
        >
          <SidebarContent />
        </motion.aside>

        {/* Backdrop for mobile */}
        {sidebarOpen && windowWidth < 768 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header with toggle button - hidden on md and larger screens */}
        {windowWidth < 768 && (
          <div className="flex items-center px-4 py-3 border-b border-border">
            <button
              onClick={handleSidebarToggle}
              className="text-muted-foreground hover:text-foreground"
            >
              {sidebarOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        )}

        {/* Content area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}; 