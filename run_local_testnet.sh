#!/bin/bash

if [[ -z "$ETH_MAINNET_NODE" ]] ; then
    echo "Must set ETH_MAINNET_NODE env variable to the url of a synced mainnet node to fork"
    exit 1
fi

MNEMONIC=('truly always spare panther raw room inch main object argue token sibling')
DAI_HOLDER="0xd580D07e01fb01149A54eb547f6A8806757B24e0"

ganache-cli --mnemonic "${MNEMONIC[@]}" --fork $ETH_MAINNET_NODE --unlock $DAI_HOLDER
