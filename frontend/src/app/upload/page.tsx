'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import RiskGauge from '@/components/RiskGauge'
import {
  Upload, Video, Mic, Layers, Play, Loader2,
  CheckCircle, AlertTriangle, Info, Zap, FileVideo, FileAudio,
  X, RotateCcw
} from 'lucide-react'
import {
  analyzeVideo, analyzeAudio, analyzeMultimodal, simulateDemo,
  AnalysisResult, getRiskColor, getRiskClass
} from '@/lib/api'
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

type Mode = 'video' | 'audio' | 'multimodal' | 'live' | 'demo'

export default function UploadPage() {
  const [mode, setMode] = useState<Mode>('demo')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  const [recordedPreview, setRecordedPreview] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<{ t: number; v: number; p: number }[]>([])
  const videoInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const videoPreviewRef = useRef<HTMLVideoElement>(null)

  const reset = () => {
    setResult(null)
    setError(null)
    setVideoFile(null)
    setAudioFile(null)
    setRecordedPreview(null)
    setRecording(false)
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop())
      setMediaStream(null)
    }
  }

  const startLiveStream = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Webcam and microphone access is not supported by your browser.')
      return
    }

    setLoading(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      setMediaStream(stream)
      setError(null)
    } catch (e: any) {
      console.error('Live stream permission error:', e)
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setError('Webcam or microphone permission was denied. Allow access and refresh the page.')
      } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
        setError('No webcam or microphone was found. Connect a device and try again.')
      } else if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
        setError('Unable to open your webcam or microphone. Close other apps using them and retry.')
      } else {
        setError('Unable to access webcam or microphone. Allow permission and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const stopLiveStream = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop())
      setMediaStream(null)
    }
  }

  const getSupportedMimeType = (type: 'video' | 'audio') => {
    const candidates = type === 'video'
      ? ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
      : ['audio/webm', 'audio/ogg']

    return candidates.find(mime => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported?.(mime)) ?? ''
  }

  const captureLiveSample = async () => {
    if (!mediaStream) {
      setError('Start the webcam and microphone first before recording.')
      return
    }

    if (recording) {
      return
    }

    if (typeof MediaRecorder === 'undefined') {
      setError('Live recording is not supported in this browser.')
      return
    }

    setError(null)
    setRecording(true)
    setLoading(true)

    try {
      const videoTrack = mediaStream.getVideoTracks()[0]
      const audioTrack = mediaStream.getAudioTracks()[0]
      if (!videoTrack || !audioTrack) {
        throw new Error('Webcam or microphone track is unavailable.')
      }

      const videoStream = new MediaStream([videoTrack])
      const audioStream = new MediaStream([audioTrack])
      const videoMime = getSupportedMimeType('video')
      const audioMime = getSupportedMimeType('audio')
      const videoRecorder = videoMime
        ? new MediaRecorder(videoStream, { mimeType: videoMime })
        : new MediaRecorder(videoStream)
      const audioRecorder = audioMime
        ? new MediaRecorder(audioStream, { mimeType: audioMime })
        : new MediaRecorder(audioStream)
      const videoChunks: BlobPart[] = []
      const audioChunks: BlobPart[] = []

      videoRecorder.ondataavailable = event => { if (event.data.size) videoChunks.push(event.data) }
      audioRecorder.ondataavailable = event => { if (event.data.size) audioChunks.push(event.data) }

      const whenStopped = new Promise<void>((resolve, reject) => {
        let finished = 0
        const markDone = () => { finished += 1; if (finished === 2) resolve() }

        videoRecorder.onstop = markDone
        audioRecorder.onstop = markDone
        videoRecorder.onerror = reject
        audioRecorder.onerror = reject
      })

      videoRecorder.start()
      audioRecorder.start()
      setTimeout(() => {
        if (videoRecorder.state === 'recording') videoRecorder.stop()
        if (audioRecorder.state === 'recording') audioRecorder.stop()
      }, 4000)

      await whenStopped

      const videoBlob = new Blob(videoChunks, { type: videoMime || 'video/webm' })
      const audioBlob = new Blob(audioChunks, { type: audioMime || 'audio/webm' })
      const nextVideo = new File([videoBlob], 'live_video.webm', { type: videoMime || 'video/webm' })
      const nextAudio = new File([audioBlob], 'live_audio.webm', { type: audioMime || 'audio/webm' })

      setVideoFile(nextVideo)
      setAudioFile(nextAudio)
      setRecordedPreview(URL.createObjectURL(videoBlob))

      if (mode === 'live') {
        const analysis = await analyzeMultimodal(nextVideo, nextAudio)
        setResult(analysis)
        setHistory(prev => [...prev, { t: prev.length + 1, v: analysis.violence_score * 100, p: analysis.panic_score * 100 }].slice(-20))
      }
    } catch (e: any) {
      console.error('Live recording error:', e)
      setError(e.message || 'Live recording failed. Please retry.')
    } finally {
      setRecording(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (videoPreviewRef.current && mediaStream) {
      videoPreviewRef.current.srcObject = mediaStream
    }
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [mediaStream])

  const handleRun = async () => {
    setLoading(true)
    setError(null)
    try {
      let r: AnalysisResult
      if (mode === 'demo') {
        r = await simulateDemo()
      } else if (mode === 'video' && videoFile) {
        r = await analyzeVideo(videoFile)
      } else if (mode === 'audio' && audioFile) {
        r = await analyzeAudio(audioFile)
      } else if (mode === 'multimodal' && videoFile && audioFile) {
        r = await analyzeMultimodal(videoFile, audioFile)
      } else if (mode === 'live' && videoFile && audioFile) {
        r = await analyzeMultimodal(videoFile, audioFile)
      } else {
        throw new Error('Please provide the required file(s) for the selected mode.')
      }
      setResult(r)
      setHistory(prev => [
        ...prev,
        { t: prev.length + 1, v: r.violence_score * 100, p: r.panic_score * 100 }
      ].slice(-20))
    } catch (e: any) {
      setError(e.message || 'Analysis failed. Ensure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const DropZone = ({ type, file, setFile, inputRef }: {
    type: 'video' | 'audio'
    file: File | null
    setFile: (f: File | null) => void
    inputRef: React.RefObject<HTMLInputElement>
  }) => {
    const onDrop = useCallback((e: React.DragEvent) => {
      e.preventDefault()
      const f = e.dataTransfer.files[0]
      if (f) setFile(f)
    }, [setFile])

    return (
      <div
        onDrop={onDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className={`relative glass rounded-xl p-6 border-2 border-dashed cursor-pointer transition-all group
          ${file ? 'border-accent/40 bg-accent/5' : 'border-border hover:border-accent/30 hover:bg-white/2'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={type === 'video' ? 'video/*' : 'audio/*'}
          className="hidden"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <div className="flex items-center gap-3">
            {type === 'video'
              ? <FileVideo className="w-8 h-8 text-accent" />
              : <FileAudio className="w-8 h-8 text-accent" />}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-mono truncate">{file.name}</p>
              <p className="text-muted text-xs font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); setFile(null) }}
              className="text-muted hover:text-danger p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            {type === 'video'
              ? <Video className="w-8 h-8 text-muted mx-auto mb-2 group-hover:text-accent transition-colors" />
              : <Mic className="w-8 h-8 text-muted mx-auto mb-2 group-hover:text-accent transition-colors" />}
            <p className="text-white text-sm font-mono">Drop {type} file</p>
            <p className="text-muted text-xs font-mono mt-1">
              {type === 'video' ? 'MP4, AVI, MOV' : 'WAV, MP3, OGG'}
            </p>
          </div>
        )}
      </div>
    )
  }

  const modes: { id: Mode; icon: typeof Video; label: string; desc: string }[] = [
    { id: 'demo', icon: Zap, label: 'DEMO', desc: 'Simulated analysis' },
    { id: 'video', icon: Video, label: 'VIDEO', desc: 'Violence detection' },
    { id: 'audio', icon: Mic, label: 'AUDIO', desc: 'Panic detection' },
    { id: 'multimodal', icon: Layers, label: 'FUSION', desc: 'Video + Audio' },
    { id: 'live', icon: Upload, label: 'LIVE', desc: 'Webcam + Mic monitoring' },
  ]

  return (
    <div className="min-h-screen pt-16">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="text-accent text-xs font-mono tracking-widest mb-1">ANALYSIS ENGINE</p>
          <h1 className="font-display text-2xl font-bold text-white tracking-wide">UPLOAD & ANALYZE</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — controls */}
          <div className="space-y-6">
            {/* Mode selector */}
            <div className="glass rounded-xl p-4">
              <p className="text-muted text-xs font-mono tracking-widest mb-3">SELECT MODE</p>
              <div className="grid grid-cols-2 gap-2">
                {modes.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setMode(m.id); reset() }}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all
                      ${mode === m.id
                        ? 'bg-accent/10 border-accent/40 text-accent glow-accent'
                        : 'border-border/50 text-muted hover:text-white hover:border-border'}`}
                  >
                    <m.icon className="w-4 h-4 shrink-0" />
                    <div>
                      <p className="text-xs font-display font-bold tracking-wider">{m.label}</p>
                      <p className="text-xs font-mono opacity-60">{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* File inputs */}
            {mode !== 'demo' && mode !== 'live' && (
              <div className="space-y-3">
                {(mode === 'video' || mode === 'multimodal') && (
                  <DropZone
                    type="video"
                    file={videoFile}
                    setFile={setVideoFile}
                    inputRef={videoInputRef}
                  />
                )}
                {(mode === 'audio' || mode === 'multimodal') && (
                  <DropZone
                    type="audio"
                    file={audioFile}
                    setFile={setAudioFile}
                    inputRef={audioInputRef}
                  />
                )}
              </div>
            )}

            {mode === 'live' && (
              <div className="glass rounded-xl p-4 space-y-4">
                <p className="text-muted text-xs font-mono tracking-widest">LIVE MONITORING</p>
                <p className="text-white text-sm font-mono leading-relaxed">
                  Record a short live segment from your webcam and microphone for real-time multimodal analysis.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={startLiveStream}
                    disabled={!!mediaStream}
                    className="py-3 px-4 rounded-xl bg-border/80 text-white text-sm font-mono hover:bg-accent/10 transition"
                  >
                    Start Camera
                  </button>
                  <button
                    onClick={stopLiveStream}
                    disabled={!mediaStream}
                    className="py-3 px-4 rounded-xl bg-border/80 text-white text-sm font-mono hover:bg-accent/10 transition"
                  >
                    Stop Camera
                  </button>
                  <button
                    onClick={captureLiveSample}
                    disabled={!mediaStream || recording}
                    className="py-3 px-4 rounded-xl bg-accent text-bg text-sm font-mono hover:bg-accent/90 transition"
                  >
                    {recording ? 'Recording...' : 'Record 4s Sample'}
                  </button>
                </div>
                <div className="rounded-xl overflow-hidden border border-border bg-slate-950/30">
                  <video
                    ref={videoPreviewRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-52 object-cover bg-black"
                  />
                </div>
                {recordedPreview && (
                  <div className="rounded-xl overflow-hidden border border-accent/20">
                    <video
                      src={recordedPreview}
                      controls
                      className="w-full h-52 object-cover bg-black"
                    />
                  </div>
                )}
              </div>
            )}

            {mode === 'demo' && (
              <div className="glass rounded-xl p-4 border-accent/10">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <p className="text-muted text-xs font-mono leading-relaxed">
                    Demo mode runs simulated inference using the fusion model. Click <span className="text-white">RUN ANALYSIS</span> to generate a sample detection result. Connect the backend API for real inference.
                  </p>
                </div>
              </div>
            )}

            {/* Run button */}
            <button
              onClick={handleRun}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-display text-sm font-bold tracking-widest transition-all
                ${loading
                  ? 'bg-accent/20 text-accent/50 cursor-not-allowed'
                  : 'bg-accent text-bg hover:bg-accent/90 glow-accent cursor-pointer'}`}
            >
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> ANALYZING...</>
                : <><Play className="w-5 h-5" /> RUN ANALYSIS</>}
            </button>

            {error && (
              <div className="risk-bg-high rounded-xl p-4 flex gap-3 items-start border">
                <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                <p className="text-danger text-xs font-mono">{error}</p>
              </div>
            )}
          </div>

          {/* Right — results */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Gauges */}
                <div className="glass rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-muted text-xs font-mono tracking-widest">DETECTION SCORES</p>
                    <button onClick={reset} className="text-muted hover:text-white text-xs font-mono flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  </div>
                  <div className="flex flex-wrap justify-around gap-6">
                    <div className="text-center">
                      <RiskGauge
                        score={result.violence_score}
                        label="Violence"
                        riskLevel={result.risk_level}
                        size={160}
                      />
                    </div>
                    <div className="text-center">
                      <RiskGauge
                        score={result.panic_score}
                        label="Panic"
                        riskLevel={result.risk_level}
                        size={160}
                      />
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="glass rounded-xl p-4 grid grid-cols-2 gap-3">
                  {[
                    { label: 'RISK LEVEL', value: result.risk_level, color: getRiskColor(result.risk_level) },
                    { label: 'CONFIDENCE', value: `${(result.confidence * 100).toFixed(1)}%`, color: '#00d4ff' },
                    { label: 'PROCESS TIME', value: `${result.processing_time_ms.toFixed(0)}ms`, color: '#a78bfa' },
                    { label: 'ALERT', value: result.alert_triggered ? 'TRIGGERED' : 'NONE', color: result.alert_triggered ? '#ff2d55' : '#00e87a' },
                  ].map(m => (
                    <div key={m.label} className="bg-white/2 rounded-lg p-3 border border-border/30">
                      <p className="text-muted text-xs font-mono tracking-widest mb-1">{m.label}</p>
                      <p className="font-display text-sm font-bold" style={{ color: m.color }}>{m.value}</p>
                    </div>
                  ))}
                </div>

                {/* Trend chart */}
                {history.length > 1 && (
                  <div className="glass rounded-xl p-4">
                    <p className="text-muted text-xs font-mono tracking-widest mb-4">SCORE TREND</p>
                    <ResponsiveContainer width="100%" height={120}>
                      <LineChart data={history}>
                        <XAxis dataKey="t" hide />
                        <YAxis domain={[0, 100]} hide />
                        <Tooltip
                          contentStyle={{ background: '#0d1117', border: '1px solid #1f2937', borderRadius: 8, fontSize: 11, fontFamily: 'monospace' }}
                          formatter={(v: number) => `${v.toFixed(1)}%`}
                        />
                        <Line type="monotone" dataKey="v" stroke="#ff2d55" strokeWidth={2} dot={false} name="Violence" />
                        <Line type="monotone" dataKey="p" stroke="#00d4ff" strokeWidth={2} dot={false} name="Panic" />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-danger" /><span className="text-xs font-mono text-muted">Violence</span></div>
                      <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-accent" /><span className="text-xs font-mono text-muted">Panic</span></div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="glass rounded-xl flex items-center justify-center h-64">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-muted mx-auto mb-3 opacity-40" />
                  <p className="text-muted text-xs font-mono tracking-widest">SELECT MODE & RUN ANALYSIS</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
