"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Play, Pause, Square, FileText, Clock, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

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
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetchMeetings();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording:", error);
      alert("Could not access microphone. Please allow microphone access.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
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
    if (!audioBlob || !selectedMeeting) return;

    setIsProcessing(true);
    try {
      // Simulate transcription processing (in real app, this would call Whisper API)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const mockResult: TranscriptionResult = {
        transcript: `[Meeting Transcript]\n\nSpeaker 1: Welcome everyone to today's meeting.\n\nSpeaker 2: Thank you for organizing this. I wanted to discuss the project timeline.\n\nSpeaker 1: Sure, let me share my screen. As you can see, we're on track for the first milestone.\n\nSpeaker 2: That looks good. What about the resource allocation for next sprint?\n\nSpeaker 1: We have enough capacity. I'll send the detailed breakdown after the meeting.\n\nSpeaker 2: Perfect. Any other items we need to cover?\n\nSpeaker 1: Just the action items. I'll assign tasks in the project management tool.\n\nSpeaker 2: Great, thanks everyone.`,
        summary: "The team reviewed the project timeline and confirmed progress is on track for the first milestone. Resource allocation for the next sprint was discussed and found to be sufficient. Action items will be assigned in the project management tool.",
        actionItems: [
          "Send detailed resource breakdown after meeting",
          "Assign action items in project management tool",
          "Schedule follow-up meeting for next week",
        ],
      };

      setTranscriptionResult(mockResult);

      // Save to database
      await fetch("/api/transcriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingId: selectedMeeting,
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Meeting Transcription</h1>
        <p className="text-gray-600 mt-1">Record, transcribe, and summarize your meetings</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recording Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Recording Studio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Meeting</label>
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

            <div className="flex flex-col items-center py-6">
              <div className="text-4xl font-mono mb-4">{formatTime(recordingTime)}</div>
              <div className="flex gap-3">
                {!isRecording ? (
                  <Button
                    size="lg"
                    onClick={startRecording}
                    disabled={!selectedMeeting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={pauseRecording}
                    >
                      {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                    </Button>
                    <Button
                      size="lg"
                      onClick={stopRecording}
                      className="bg-gray-600 hover:bg-gray-700"
                    >
                      <Square className="w-5 h-5 mr-2" />
                      Stop
                    </Button>
                  </>
                )}
              </div>
            </div>

            {audioBlob && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">Recording Ready</span>
                  <Badge variant="outline">{formatTime(recordingTime)}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={isPlaying ? pauseAudio : playAudio}>
                    {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                    {isPlaying ? "Pause" : "Play"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadAudio}>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    onClick={processTranscription}
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Transcribe"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transcription Result Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Transcription Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isProcessing ? (
              <div className="flex flex-col items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Processing transcription...</p>
                <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
              </div>
            ) : transcriptionResult ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Summary</h3>
                  <p className="text-gray-600 text-sm">{transcriptionResult.summary}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Action Items</h3>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {transcriptionResult.actionItems.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Full Transcript</h3>
                  <Textarea
                    value={transcriptionResult.transcript}
                    readOnly
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No transcription yet</p>
                <p className="text-sm mt-1">Record a meeting and click "Transcribe" to get started</p>
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
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
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
                      <Badge
                        className={
                          meeting.transcription?.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
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
