import os
import torch
import torchvision.transforms as transforms
from pathlib import Path


class HistoPathModel:
    def __init__(self, device="cpu"):
        self.device = device
        self.model_path = None
        self.model = self._load_model()
        self.transform = self._get_transforms()

    def _find_model_file(self):
        """Find the model file via MODEL_PATH or common locations."""
        env_path = os.getenv("MODEL_PATH", "").strip()
        if env_path:
            candidate = Path(env_path)
            if candidate.exists():
                return candidate
            raise FileNotFoundError(f"MODEL_PATH set but file not found: {env_path}")

        possible_names = ["model_best.pth", "best_model.pth"]
        possible_paths = [
            Path.cwd(),
            Path.cwd() / "models",
            Path(__file__).parent.parent.parent / "models",
            Path(__file__).parent.parent.parent.parent / "model" / "models",
        ]

        for path in possible_paths:
            if path.exists():
                for name in possible_names:
                    model_path = path / name
                    if model_path.exists():
                        return model_path

        raise FileNotFoundError(
            "Model file not found. Set MODEL_PATH or place model_best.pth / best_model.pth in:\n"
            + "\n".join(f"- {p}" for p in possible_paths)
        )

    def _load_model(self):
        """Load the model from disk."""
        try:
            model_path = self._find_model_file()
            self.model_path = model_path
            print(f"Found model at: {model_path}")

            from src.model.model import get_model

            checkpoint = torch.load(
                str(model_path),
                map_location=self.device,
                weights_only=False,
            )
            model = get_model(name="mobilenet_v2", num_classes=2, pretrained=False)

            if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
                state_dict = checkpoint["model_state_dict"]
            elif isinstance(checkpoint, dict) and "state_dict" in checkpoint:
                state_dict = checkpoint["state_dict"]
            else:
                state_dict = checkpoint

            model.load_state_dict(state_dict)
            model.eval()
            return model
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            raise

    def _get_transforms(self):
        return transforms.Compose(
            [
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225],
                ),
            ]
        )

    @torch.no_grad()
    def predict(self, image):
        """
        Make prediction on a single image.

        Args:
            image: PIL Image object

        Returns:
            dict: Prediction results with class and confidence
        """
        tensor = self.transform(image).unsqueeze(0)
        outputs = self.model(tensor)
        probs = torch.nn.functional.softmax(outputs, dim=1)
        confidence, predicted = torch.max(probs, 1)
        class_probs = probs[0].tolist()

        return {
            "prediction": "malignant" if predicted.item() == 1 else "benign",
            "confidence": confidence.item(),
            "probabilities": {
                "benign": class_probs[0],
                "malignant": class_probs[1],
            },
        }


_model_instance = None


def get_model(device="cpu"):
    """Get or create the model instance (singleton pattern)."""
    global _model_instance
    if _model_instance is None:
        _model_instance = HistoPathModel(device)
    return _model_instance
