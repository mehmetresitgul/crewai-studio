import sys
from my_crew.crew import MyCrew


def run():
    topic = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "Yapay Zeka"
    inputs = {"topic": topic}
    MyCrew().crew().kickoff(inputs=inputs)


def train():
    topic = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "Yapay Zeka"
    inputs = {"topic": topic}
    MyCrew().crew().train(n_iterations=3, filename="training.pkl", inputs=inputs)


def replay():
    task_id = sys.argv[1] if len(sys.argv) > 1 else ""
    MyCrew().crew().replay(task_id=task_id)


def test():
    topic = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "Yapay Zeka"
    inputs = {"topic": topic}
    MyCrew().crew().test(n_iterations=2, openai_model_name="openai/claude-sonnet-4-6", inputs=inputs)


if __name__ == "__main__":
    run()
