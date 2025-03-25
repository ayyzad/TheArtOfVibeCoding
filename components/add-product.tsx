"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner";
import { Toaster } from "sonner";
import { addProductAction } from "@/lib/actions/product"

export function AddProductDialog() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  
  // Only require URL field
  const [url, setUrl] = useState("");
  
  const handleSubmit = async () => {
    console.log("Submit button clicked", { url });
    
    // Validate URL field
    if (!url) {
      console.log("URL is empty");
      toast.error("Please enter a URL");
      return;
    }
    
    // Prepare URL with proper prefix if needed
    let processedUrl = url;
    
    // If URL doesn't start with http:// or https://, add https://
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      processedUrl = 'https://' + url;
    }
    
    // If URL doesn't have www. and doesn't have a subdomain, add www.
    if (!processedUrl.includes('://www.') && 
        processedUrl.split('://')[1] && 
        !processedUrl.split('://')[1].includes('.', processedUrl.split('://')[1].indexOf('.') + 1)) {
      const parts = processedUrl.split('://');
      processedUrl = parts[0] + '://www.' + parts[1];
    }
    
    // Basic validation to ensure the URL is valid even after processing
    try {
      new URL(processedUrl);
    } catch (e) {
      console.log("Invalid URL even after processing:", processedUrl);
      toast.error("Please enter a valid URL");
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await addProductAction({
        url: processedUrl
      });
      
      if (result.status === 401) {
        // User is not authenticated, redirect to sign-up page
        toast.error("You must be signed in to add a product");
        router.push('/sign-in');
        return;
      }
      
      if (result.status !== 200) {
        throw new Error(result.error || 'Failed to add product');
      }
      
      // Success
      toast.success("Product added successfully!");
      
      // Reset form and close dialog
      resetForm();
      setOpen(false);
      
      // Refresh the page to show the new product
      router.refresh();
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setUrl("");
  };
  
  return (
    <>
      <Toaster position="top-right" />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setOpen(true)}>Share A Product or Resource</Button>
        </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add Vibe Coding Resource</DialogTitle>
          <DialogDescription>
            Share a useful tool or resource with the community.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="url" className="text-right">
              URL *
            </Label>
            <Input 
              id="url" 
              value={url} 
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)} 
              className="col-span-3" 
              placeholder="https://example.com/resource"
              type="url"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="button" 
            onClick={handleSubmit} 
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Resource"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
