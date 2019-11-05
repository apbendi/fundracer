#!/bin/bash

if [[ -z "$ETH_MAINNET_NODE" ]] ; then
    echo "Must set ETH_MAINNET_NODE env variable to the url of a synced mainnet node to fork"
    exit 1
fi

MNEMONIC=('truly always spare panther raw room inch main object argue token sibling')
ganache-cli --mnemonic "${MNEMONIC[@]}" --fork $ETH_MAINNET_NODE
