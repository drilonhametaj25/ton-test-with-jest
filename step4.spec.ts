import * as fs from "fs";
import { Cell } from "@ton/core";
import { Blockchain, SandboxContract, TreasuryContract } from "@ton/sandbox";
import {CounterContract} from "./CounterContract"; // this is the interface class from tutorial 2

describe("Counter tests", () => {
  let blockchain: Blockchain;
  let wallet1: SandboxContract<TreasuryContract>;
  let counterContract: SandboxContract<CounterContract>;

  beforeEach(async () =>  {
    // prepare Counter's initial code and data cells for deployment
    const counterCode = Cell.fromBoc(fs.readFileSync("counter_contract.cell"))[0]; // compilation output from tutorial 2
    const initialCounterValue = 17; // no collisions possible since sandbox is a private local instance
    const counter = CounterContract.createForDeploy(counterCode, initialCounterValue);

    // initialize the blockchain sandbox
    blockchain = await Blockchain.create();
    wallet1 = await blockchain.treasury("user1");

    // deploy counter
    counterContract = blockchain.openContract(counter);
    await counterContract.sendDeploy(wallet1.getSender());
  }),

  it("should increment the counter value", async () =>  {
    await counterContract.sendIncrement(wallet1.getSender());
    const counterValue = await counterContract.getCounter();
    expect(counterValue).toEqual(18n);
  })
});
