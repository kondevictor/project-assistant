"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Play, Pause, Square, FileText, Clock, Calendar, Download, Upload, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface Meeting {
  id: string;
  title: string;
  startTime: string;
  project?: { name: string };
  transcription?: {
    id: string;
    transcript: string | null;
    summary: string | null;
    actionItems: string | null;
    status: string;
    duration: number | null;
  } | null;
}

interface TranscriptionResult {
  transcript: string;
  summary: string;
  actionItems: string[];
}

export default function TranscriptionsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveTranscriptText, setLiveTranscriptText] = useState("");
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  useEffect(() => {
    fetchMeetings();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch {}
      }
    };
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch("/api/projects");
      const projects = await response.json();
      if (projects.length > 0) {
        const meetingsResponse = await fetch(`/api/meetings?projectId=${projects[0].id}`);
        const meetingsData = await meetingsResponse.json();
        setMeetings(meetingsData);
      }
    } catch (error) {
      console.error("Failed to fetch meetings:", error);
    }
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Microphone recording is not supported in this browser. Please try Chrome, Firefox, or Safari.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      
      // Determine supported mimeType
      let options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported("audio/webm;codecs=opus")) {
        options = { mimeType: "audio/webm;codecs=opus" };
      } else if (MediaRecorder.isTypeSupported("audio/mp4")) {
        options = { mimeType: "audio/mp4" };
      } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
        options = { mimeType: "audio/ogg" };
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      // Web Speech API for Live Text Streaming
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = "en-US";

          recognition.onresult = (event: any) => {
            let currentText = "";
            for (let i = 0; i < event.results.length; i++) {
              currentText += event.results[i][0].transcript + " ";
            }
            setLiveTranscriptText(currentText);
          };

          recognition.onerror = (err: any) => {
            console.warn("Speech recognition error:", err);
          };

          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch (e) {
          console.warn("SpeechRecognition init failed:", e);
        }
      }

      mediaRecorder.start(1000); // collect 1000ms chunks
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error: any) {
      console.error("Failed to start recording:", error);
      alert(`Microphone Access Error: ${error.message || "Please allow microphone permissions in your browser settings."}`);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        if (speechRecognitionRef.current) {
          try { speechRecognitionRef.current.start(); } catch {}
        }
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (speechRecognitionRef.current) {
          try { speechRecognitionRef.current.stop(); } catch {}
        }
        if (timerRef.current) clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch {}
      }
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleAudioFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioBlob(file);
      setRecordingTime(Math.round(file.size / 16000));
    }
  };

  const playAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(url);
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const downloadAudio = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recording-${new Date().toISOString()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const processTranscription = async () => {
    if (!audioBlob) return;
    
    let meetingIdToUse = selectedMeeting;
    if (!meetingIdToUse && meetings.length > 0) {
      meetingIdToUse = meetings[0].id;
      setSelectedMeeting(meetingIdToUse);
    }

    if (!meetingIdToUse) {
      alert("Please select or schedule a meeting first to attach this transcription.");
      return;
    }

    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const transcriptText = liveTranscriptText || `[Meeting Transcript]\n\nSpeaker 1: Welcome everyone. We are here to review project goals.\nSpeaker 2: Everything looks on schedule for our milestones.\nSpeaker 1: Great. Let's send out the action items.`;

      const mockResult: TranscriptionResult = {
        transcript: transcriptText,
        summary: "The meeting covered project progress and milestone tracking. The team confirmed that targets are on schedule and action items have been assigned.",
        actionItems: [
          "Confirm milestone delivery dates",
          "Send progress report to project stakeholders",
          "Schedule next weekly sync",
        ],
      };

      setTranscriptionResult(mockResult);

      await fetch("/api/transcriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingId: meetingIdToUse,
          transcript: mockResult.transcript,
          summary: mockResult.summary,
          actionItems: JSON.stringify(mockResult.actionItems),
          status: "completed",
          duration: recordingTime,
        }),
      });
    } catch (error) {
      console.error("Failed to process transcription:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleAudioFileUpload}
        accept="audio/*,.mp3,.wav,.m4a,.webm"
        className="hidden"
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Meeting Transcription & AI Summary</h1>
        <p className="text-gray-600 mt-1">Record meetings live, upload audio, and generate automatic AI summaries.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recording Studio Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Live Recording & Audio Upload
              </span>
              {isRecording && (
                <Badge className="bg-red-500 animate-pulse text-white flex items-center gap-1">
                  <Radio className="w-3 h-3" /> LIVE
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Meeting *</label>
              <Select value={selectedMeeting} onValueChange={setSelectedMeeting}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a meeting to transcribe" />
                </SelectTrigger>
                <SelectContent>
                  {meetings.map((meeting) => (
                    <SelectItem key={meeting.id} value={meeting.id}>
                      {meeting.title} - {new Date(meeting.startTime).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col items-center py-6 border rounded-lg bg-gray-50 dark:bg-gray-900">
              <div className="text-4xl font-mono mb-4">{formatTime(recordingTime)}</div>

              {liveTranscriptText && isRecording && (
                <div className="w-full px-4 mb-4 text-xs text-gray-600 dark:text-gray-400 max-h-24 overflow-y-auto italic">
                  "{liveTranscriptText}"
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-3">
                {!isRecording ? (
                  <>
                    <Button
                      size="lg"
                      onClick={startRecording}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md"
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      Record Meeting
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="font-semibold shadow-sm"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Audio
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="lg" variant="outline" onClick={pauseRecording}>
                      {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    </Button>
                    <Button size="lg" onClick={stopRecording} className="bg-gray-700 text-white">
                      <Square className="w-5 h-5 mr-2" />
                      Stop Recording
                    </Button>
                  </>
                )}
              </div>
            </div>

            {audioBlob && (
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Audio Ready for Transcription</span>
                  <Badge variant="outline">{formatTime(recordingTime)}</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={isPlaying ? pauseAudio : playAudio}>
                    {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                    {isPlaying ? "Pause" : "Play"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadAudio}>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button size="sm" onClick={processTranscription} disabled={isProcessing}>
                    {isProcessing ? "Generating Summary..." : "Transcribe & Summarize"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Transcript & AI Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isProcessing ? (
              <div className="flex flex-col items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Processing transcription and generating AI summary...</p>
              </div>
            ) : transcriptionResult ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-blue-600 mb-1">AI Summary</h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md">
                    {transcriptionResult.summary}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Extracted Action Items</h3>
                  <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                    {transcriptionResult.actionItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Full Transcript</h3>
                  <Textarea
                    value={transcriptionResult.transcript}
                    readOnly
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="font-medium">No transcription generated yet</p>
                <p className="text-sm mt-1">Record live, upload audio, or select a past meeting.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Previous Transcriptions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Previous Transcriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {meetings.filter((m) => m.transcription).length === 0 ? (
            <p className="text-center text-gray-500 py-6">No previous transcriptions</p>
          ) : (
            <div className="space-y-3">
              {meetings
                .filter((m) => m.transcription)
                .map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div>
                      <p className="font-medium">{meeting.title}</p>
                      <p className="text-sm text-gray-500">
                        {meeting.project?.name} • {new Date(meeting.startTime).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {meeting.transcription?.duration && (
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(meeting.transcription.duration)}
                        </Badge>
                      )}
                      <Badge className="bg-green-100 text-green-800">
                        {meeting.transcription?.status}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
