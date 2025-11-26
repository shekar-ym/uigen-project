import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolCallDisplay } from "../ToolCallDisplay";

afterEach(() => {
  cleanup();
});

// Helper function to create tool invocation objects
function createToolInvocation(
  toolName: string,
  args: Record<string, any>,
  state: string = "result",
  result: any = "Success"
) {
  return {
    toolCallId: "test-id",
    args,
    toolName,
    state,
    result,
  };
}

// Test str_replace_editor tool with different commands
test("ToolCallDisplay shows 'Creating' message for str_replace_editor create command", () => {
  const toolInvocation = createToolInvocation("str_replace_editor", {
    command: "create",
    path: "/src/components/Card.jsx",
  });

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText("Creating Card.jsx")).toBeDefined();
});

test("ToolCallDisplay shows 'Editing' message for str_replace_editor str_replace command", () => {
  const toolInvocation = createToolInvocation("str_replace_editor", {
    command: "str_replace",
    path: "/src/App.tsx",
  });

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText("Editing App.tsx")).toBeDefined();
});

test("ToolCallDisplay shows 'Reading' message for str_replace_editor view command", () => {
  const toolInvocation = createToolInvocation("str_replace_editor", {
    command: "view",
    path: "/src/utils/helpers.ts",
  });

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText("Reading helpers.ts")).toBeDefined();
});

test("ToolCallDisplay shows 'Updating' message for str_replace_editor insert command", () => {
  const toolInvocation = createToolInvocation("str_replace_editor", {
    command: "insert",
    path: "/styles/main.css",
  });

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText("Updating main.css")).toBeDefined();
});

test("ToolCallDisplay shows 'Reverting' message for str_replace_editor undo_edit command", () => {
  const toolInvocation = createToolInvocation("str_replace_editor", {
    command: "undo_edit",
    path: "/src/Button.jsx",
  });

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText("Reverting Button.jsx")).toBeDefined();
});

// Test file_manager tool with different commands
test("ToolCallDisplay shows 'Renaming' message for file_manager rename command", () => {
  const toolInvocation = createToolInvocation("file_manager", {
    command: "rename",
    path: "/src/Card.jsx",
    new_path: "/src/Button.jsx",
  });

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText("Renaming Card.jsx to Button.jsx")).toBeDefined();
});

test("ToolCallDisplay shows 'Deleting' message for file_manager delete command", () => {
  const toolInvocation = createToolInvocation("file_manager", {
    command: "delete",
    path: "/src/old-component.tsx",
  });

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText("Deleting old-component.tsx")).toBeDefined();
});

// Test different file path formats
test("ToolCallDisplay handles Windows-style paths", () => {
  const toolInvocation = createToolInvocation("str_replace_editor", {
    command: "create",
    path: "C:\\src\\components\\Dialog.jsx",
  });

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText("Creating Dialog.jsx")).toBeDefined();
});

test("ToolCallDisplay handles paths without directories", () => {
  const toolInvocation = createToolInvocation("str_replace_editor", {
    command: "create",
    path: "App.jsx",
  });

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("ToolCallDisplay handles paths with multiple extensions", () => {
  const toolInvocation = createToolInvocation("str_replace_editor", {
    command: "view",
    path: "/config/webpack.config.js",
  });

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText("Reading webpack.config.js")).toBeDefined();
});

// Test loading vs completed states
test("ToolCallDisplay shows loading spinner when not completed", () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    { command: "create", path: "/src/Card.jsx" },
    "loading"
  );

  const { container } = render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText("Creating Card.jsx")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeDefined();
});

test("ToolCallDisplay shows green dot when completed successfully", () => {
  const toolInvocation = createToolInvocation("str_replace_editor", {
    command: "create",
    path: "/src/Card.jsx",
  });

  const { container } = render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText("Creating Card.jsx")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("ToolCallDisplay shows loading spinner when state is not 'result'", () => {
  const toolInvocation = createToolInvocation(
    "str_replace_editor",
    { command: "create", path: "/src/Card.jsx" },
    "pending"
  );

  const { container } = render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(container.querySelector(".animate-spin")).toBeDefined();
});

// Test edge cases
test("ToolCallDisplay handles missing path gracefully", () => {
  const toolInvocation = createToolInvocation("str_replace_editor", {
    command: "create",
  });

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText("Creating file")).toBeDefined();
});

test("ToolCallDisplay handles empty path gracefully", () => {
  const toolInvocation = createToolInvocation("str_replace_editor", {
    command: "create",
    path: "",
  });

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText("Creating file")).toBeDefined();
});

test("ToolCallDisplay handles unknown command gracefully for str_replace_editor", () => {
  const toolInvocation = createToolInvocation("str_replace_editor", {
    command: "unknown_command",
    path: "/src/test.jsx",
  });

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText("Modifying test.jsx")).toBeDefined();
});

test("ToolCallDisplay handles unknown command gracefully for file_manager", () => {
  const toolInvocation = createToolInvocation("file_manager", {
    command: "unknown_command",
    path: "/src/test.jsx",
  });

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText("Managing test.jsx")).toBeDefined();
});

test("ToolCallDisplay handles unknown tool gracefully", () => {
  const toolInvocation = createToolInvocation("unknown_tool", {
    path: "/src/test.jsx",
  });

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText("Processing test.jsx")).toBeDefined();
});

test("ToolCallDisplay handles unknown tool without path gracefully", () => {
  const toolInvocation = createToolInvocation("unknown_tool", {});

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText("unknown_tool")).toBeDefined();
});

// Test visual styling
test("ToolCallDisplay applies correct CSS classes", () => {
  const toolInvocation = createToolInvocation("str_replace_editor", {
    command: "create",
    path: "/src/Card.jsx",
  });

  const { container } = render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  const wrapper = container.firstChild as HTMLElement;
  expect(wrapper.className).toContain("inline-flex");
  expect(wrapper.className).toContain("items-center");
  expect(wrapper.className).toContain("gap-2");
  expect(wrapper.className).toContain("bg-neutral-50");
  expect(wrapper.className).toContain("rounded-lg");
  expect(wrapper.className).toContain("text-xs");
  expect(wrapper.className).toContain("font-mono");
});

test("ToolCallDisplay shows correct text color", () => {
  const toolInvocation = createToolInvocation("str_replace_editor", {
    command: "create",
    path: "/src/Card.jsx",
  });

  const { container } = render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  const textSpan = container.querySelector("span");
  expect(textSpan?.className).toContain("text-neutral-700");
});

// Test complex file paths
test("ToolCallDisplay handles deeply nested paths", () => {
  const toolInvocation = createToolInvocation("str_replace_editor", {
    command: "create",
    path: "/very/deep/nested/folder/structure/component.jsx",
  });

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText("Creating component.jsx")).toBeDefined();
});

test("ToolCallDisplay handles paths ending with slash", () => {
  const toolInvocation = createToolInvocation("str_replace_editor", {
    command: "create",
    path: "/src/components/",
  });

  render(<ToolCallDisplay toolInvocation={toolInvocation} />);

  expect(screen.getByText("Creating file")).toBeDefined();
});