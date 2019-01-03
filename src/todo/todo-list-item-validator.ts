export enum Operation {
  Add,
  Remove,
  Any
}

class ValidationStepResult {
  constructor(public ok: boolean, public detail: string = null) {}

  static Ok() {
    return new ValidationStepResult(true);
  }

  static Nok(error: string) {
    return new ValidationStepResult(false, error);
  }
}

class ValidationStepResultData {
  constructor(public data: ValidationStepResult[]) {}

  public allOk(): boolean {
    return this.errors().length === 0;
  }

  public errors(): string[] {
    return this.data
      .map(data => (!data || data.ok ? null : data.detail))
      .filter(text => text !== null);
  }
}

export interface IValidationStepFor<TItem> {
  operationScope(): Operation;
  setContext(items: TItem[]): IValidationStepFor<TItem>;
  validate(item: TItem): ValidationStepResult;
}

type Validator<TSelf, TItem> = (owner: TSelf, item: TItem) => boolean;

export class ProxyValidator<TItem> implements IValidationStepFor<TItem> {
  private context: TItem[] = [];

  constructor(
    private operation: Operation,
    private validator: Validator<ProxyValidator<TItem>, TItem>,
    private errorDescription: string
  ) {}

  public operationScope = (): Operation => this.operation;

  public getContext = (): TItem[] => this.context;

  setContext(items: TItem[]): IValidationStepFor<TItem> {
    this.context = items;
    return this;
  }

  validate(item: TItem): ValidationStepResult {
    if (!this.validator(this, item)) {
      return ValidationStepResult.Nok(this.errorDescription);
    }
    return ValidationStepResult.Ok();
  }
}

export class ItemNotNull implements IValidationStepFor<Object> {
  private context: Object[] = [];

  public operationScope(): Operation {
    return Operation.Any;
  }

  setContext(items: Object[]): IValidationStepFor<Object> {
    this.context = items;
    return this;
  }

  public validate(item: Object): ValidationStepResult {
    if (!item || item === null || item === '') {
      return ValidationStepResult.Nok('Invalid Parameter');
    }
    return ValidationStepResult.Ok();
  }
}

export class StepsValidatorFor<TItem> {
  private steps: IValidationStepFor<TItem>[];
  constructor(...steps: IValidationStepFor<TItem>[]) {
    this.steps = steps;
  }

  public validate(
    operation: Operation,
    item: TItem,
    scope: TItem[]
  ): ValidationStepResultData {
    return new ValidationStepResultData(
      this.steps.map(step => {
        if (
          step.operationScope() == Operation.Any ||
          step.operationScope() === operation
        ) {
          return step.setContext(scope).validate(item);
        }
        return null;
      })
    );
  }
}

export class SingletonFor<Type> {
  private ctor: {new (): Type};
  private _instance: Type;

  constructor(ctor: {new (): Type}) {
    this.ctor = ctor;
  }

  public getInstance() {
    if (!this._instance) {
      this._instance = new this.ctor();
    }
    return this._instance;
  }
}

export class TodoListValidation extends StepsValidatorFor<Object> {
  constructor() {
    super(
      new ItemNotNull(),
      new ProxyValidator<Object>(
        Operation.Add,
        ($this, item) => !$this.getContext().includes(item),
        'Duplicated Item'
      )
    );
  }

  private static _instance: SingletonFor<TodoListValidation> = new SingletonFor(
    TodoListValidation
  );
  static getInstance(): TodoListValidation {
    return TodoListValidation._instance.getInstance();
  }
}
