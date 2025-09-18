import React, { useState, useRef } from 'react';
import { classNames } from '../../utils/helpers';

interface FileUploadProps {
    onFileUpload: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload }) => {
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File | null) => {
        if (file) {
            setUploadedFile(file);
            onFileUpload(file);
        }
    };
    
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true);
        } else if (e.type === "dragleave") {
            setIsDragActive(false);
        }
    };
    
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const onButtonClick = () => {
        inputRef.current?.click();
    };

    return (
        <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
            className={classNames(
                'p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors',
                isDragActive
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            )}
        >
            <input ref={inputRef} type="file" className="hidden" onChange={handleChange} />
            {uploadedFile ? (
                <div>
                    <p className="font-semibold text-gray-700 dark:text-gray-300">File selected:</p>
                    <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">{uploadedFile.name}</p>
                </div>
            ) : isDragActive ? (
                <p>Drop the file here ...</p>
            ) : (
                <div>
                    <p className="font-semibold">Drag 'n' drop a file here, or click to select</p>
                    <p className="text-sm text-gray-500 mt-1">Image, Audio, Video, or any other file.</p>
                </div>
            )}
        </div>
    );
};
