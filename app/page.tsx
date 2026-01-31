"use client";

import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type Result = {
  content: string;
  source: string;
  confidence: number;
};

export default function DocumentUpload() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingResult, setIsLoadingResult] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const [query, setQuery] = useState<string>("");
  const [result, setResult] = useState<Result>();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const result = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/ingest-file`,
        {
          body: formData,
          method: "POST",
        }
      );

      const data = await result.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: data.message || "PDF processed successfully",
        });
        e.target.value = "";
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to process PDF",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "An error occurred while processing the PDF",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAskQuery = async (e: any) => {
    e.preventDefault();
    const result = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/query`,
      {
        body: JSON.stringify({ query: query }),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await result.json();

    setQuery("");

    setResult({
      content: data.response,
      source: data.source,
      confidence: data.confidence,
    });
  };
  return (
    <div className="mt-5 p-10">
      <div>
        <div>
          <h1 className="text-lg mb-5 font-medium text-primary">
            Upload your document
          </h1>
          <Input
            id="pdf-upload"
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={isLoading}
            className="mt-2"
          />

          {isLoading && (
            <div className="flex items-center gap-2 mt-4">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-primary">Processing PDF...</span>
            </div>
          )}

          {message && (
            <Alert
              variant={message.type === "error" ? "destructive" : "default"}
            >
              <AlertTitle>
                {message.type === "error" ? "Error!" : "Success!"}
              </AlertTitle>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="mt-30">
          <h1 className="text-lg mb-5 font-medium text-primary">
            Chat with your documents
          </h1>
          <Input
            type="text"
            name="query"
            placeholder="Type your query"
            onChange={(e) => setQuery(e.target.value)}
            value={query}
          />
          <Button className="mt-5" onClick={handleAskQuery} type="submit">
            Ask
          </Button>
          <div className="">
            <h1 className="text-md mt-5 font-medium text-primary">Response</h1>
            {result && (
              <div className="">
                <p>{result.content}</p>
                <div>
                  <h1 className="text-md font-medium text-primary mt-3">
                    Source
                  </h1>
                  <p>{result.source}</p>
                </div>

                <div>
                  <h1 className="text-md font-medium text-primary mt-3">
                    Confidence
                  </h1>
                  <p>{result.confidence}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
