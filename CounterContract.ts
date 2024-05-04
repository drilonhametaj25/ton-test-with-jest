import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type CounterContractConfig = {};

export function counterContractConfigToCell(config: CounterContractConfig): Cell {
    return beginCell().endCell();
}

export class CounterContract implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new CounterContract(address);
    }

    static createFromConfig(config: CounterContractConfig, code: Cell, workchain = 0) {
        const data = counterContractConfigToCell(config);
        const init = { code, data };
        return new CounterContract(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender) {
        await provider.internal(via, {
            value: "0.01",
            bounce: false
        });
    }

    static createForDeploy(code: Cell, initialCounterValue: number): CounterContract {
        const data = beginCell()
          .storeUint(initialCounterValue, 64)
          .endCell();
        const workchain = 0; // deploy to workchain 0
        const address = contractAddress(workchain, { code, data });
        return new CounterContract(address, { code, data });
    }

    async getCounter(provider: ContractProvider) {
        const { stack } = await provider.get("counter", []);
        return stack.readBigNumber();
    }


    async sendIncrement(provider: ContractProvider, via: Sender) {
        const messageBody = beginCell()
                            .storeUint(1, 32) // op (op #1 = increment)
                            .storeUint(0, 64) // query id
                            .endCell();
        await provider.internal(via, {
        value: "0.002", // send 0.002 TON for gas
        body: messageBody
        });
    }


}
