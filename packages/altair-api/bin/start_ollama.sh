#!/bin/bash

# Only run the script if the AI_MODEL_PROVIDER is set to "ollama".
if [ "$AI_MODEL_PROVIDER" != "ollama" ]; then
  echo "AI_MODEL_PROVIDER is not set to 'ollama'. Exiting..."
  exit 0
fi

# Start Ollama in the background.
/bin/ollama serve &
# Record Process ID.
pid=$!

# Get model name from command line arguments.
model_name=${OLLAMA_MODEL_NAME:-"llama3"}

# Pause for Ollama to start.
sleep 5

echo "🔴 Retrieve $model_name model..."
ollama pull $model_name
echo "🟢 Done!"

# Wait for Ollama process to finish.
wait $pid
