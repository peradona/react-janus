import React from "react";
// import { useJanusHelper } from './helpers'

const SayHello = ({ name }: { name: string }): JSX.Element => (
    <div>Hey {name}, go hello to TypeScript.</div>
);

export { SayHello }