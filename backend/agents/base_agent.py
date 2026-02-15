class BaseAgent:
    def __init__(self, name):
        self.name = name

    def process(self, data):
        raise NotImplementedError("Subclasses must implement process method")
