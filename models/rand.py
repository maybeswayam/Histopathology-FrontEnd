import torch

# Trust your own checkpoint
model = torch.load(
    "uday-backend\\models\\model_best.pth",
    map_location="cpu",
    weights_only=False  # 👈 allow loading full model
)

print("✅ Model loaded successfully")
