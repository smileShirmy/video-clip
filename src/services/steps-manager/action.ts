export abstract class Action {
  // 撤销
  abstract undo(): void

  // 重做
  abstract redo(): void
}
