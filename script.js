const visualizer = document.getElementById('visualizer')
const volume = document.getElementById('volume')

const context = new AudioContext()
const analyserNode = new AnalyserNode(context, {fftSize: 256})
const gainNode = new GainNode(context, {gain: volume.value})

setupEventListeners()
setupContext()
resize()
drawVisualizer()

function setupEventListeners() {
  window.addEventListener('resize', resize)

  volume.addEventListener( 'input', e => {
    const value = parseFloat(e.target.value)
    gainNode.gain.value = value
  })
}

async function setupContext() {
  const audioInput = await getInput()

  if (context.state === 'suspended') {
    await context.resume()
  }
  const source = context.createMediaStreamSource(audioInput)
  source.connect(gainNode).connect(analyserNode).connect(context.destination)
}

function getInput() {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      autoGainControl: false,
      noiseSuppression: true,
      latency: 0
    }
  })
}

function drawVisualizer() {
  requestAnimationFrame(drawVisualizer)

  const bufferLength = analyserNode.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyserNode.getByteFrequencyData(dataArray)

  const width = visualizer.width
  const height = visualizer.height
  const barWidth = width / bufferLength

  const canvasContext = visualizer.getContext('2d')
  canvasContext.clearRect(0, 0, width, height)

  dataArray.forEach((item, index) => {
    const y = item / 255 * height / 2
    const x = barWidth * index

    canvasContext.fillStyle = `hsl(${y / height * 400}, 100%, 50%)`
    canvasContext.fillRect(x, height - y, barWidth, y)

  })
}

function resize() {
  visualizer.width = visualizer.clientWidth * window.devicePixelRatio
  visualizer.height = visualizer.clientHeight * window.devicePixelRatio
}