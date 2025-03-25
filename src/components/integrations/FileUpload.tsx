
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { FileUp, AlertCircle, FileText, Trash2 } from 'lucide-react';
import { useToast } from "../ui/use-toast";
import { useAuth } from '../../contexts/AuthContext';
import { parseCSVData, uploadSubscriptionData } from '../../utils/integrations/csv-import';

interface FileUploadProps {
  isDisabled?: boolean;
}

export function FileUpload({ isDisabled = false }: FileUploadProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    if (selectedFile && !selectedFile.name.endsWith('.csv')) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload a CSV file."
      });
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Parse the CSV file
      const data = await parseCSVData(file);
      
      if (!data || data.length === 0) {
        throw new Error("CSV file appears to be empty or in an invalid format");
      }
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);
      
      // Upload the data
      await uploadSubscriptionData(user.id, data);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      toast({
        title: "Upload Successful",
        description: `Successfully imported ${data.length} subscription records.`
      });
      
      // Reset after short delay
      setTimeout(() => {
        setFile(null);
        setUploadProgress(0);
      }, 2000);
    } catch (error) {
      console.error("Error uploading CSV:", error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Could not process your CSV file. Please check the format and try again."
      });
    } finally {
      setIsUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>CSV Import</CardTitle>
        <CardDescription>
          Upload subscription data from a CSV file
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!file ? (
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center ${isDisabled ? 'opacity-50' : 'hover:bg-gray-50 cursor-pointer'}`}
            onClick={() => !isDisabled && fileInputRef.current?.click()}
          >
            <FileUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500 mb-1">
              Drag and drop your CSV file here, or click to browse
            </p>
            <p className="text-xs text-gray-400">
              Supported format: CSV with headers for customer_id, plan, amount, start_date, status
            </p>
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept=".csv" 
              onChange={handleFileChange}
              disabled={isDisabled}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFile}
                disabled={isUploading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            
            {isUploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
          <p className="text-xs text-gray-500">
            To ensure successful import, download our <a href="#" className="text-blue-600 hover:underline">CSV template</a> and follow the format instructions.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          disabled={!file || isUploading || isDisabled} 
          onClick={handleUpload}
        >
          {isUploading ? `Uploading (${uploadProgress}%)` : "Upload Data"}
        </Button>
      </CardFooter>
    </Card>
  );
}
