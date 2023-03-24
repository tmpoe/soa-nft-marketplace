```plantuml
@startuml
actor user
participant Frontend as frontend
participant "Fee Gatekeeper" as fee_gatekeeper <<contract>>
participant "Server" as server
participant "Cat Attributes" as cat_attributes <<contract>>
participant "Oracle" as oracle
participant "IPFS" as ipfs <<pinata>>
participant "Nft Marketplace" as nft_marketplace <<contract>>
participant "Cat Nft" as cat_nft <<contract>>

user -> frontend : mint nft
frontend -> fee_gatekeeper : request with fee

alt If fee < mint fee
    fee_gatekeeper --> frontend : deny
    frontend --> user : insufficient funds provided
end

fee_gatekeeper -> nft_marketplace : transfer funds

alt If fund transfer fails
    nft_marketplace --> server : something went wrong
    server --> frontend : something went wrong
    frontend --> user : try again
end

server -> cat_attributes : request cat attributes
cat_attributes -> oracle : request random numbers
oracle --> cat_attributes : send random numbers

server -> IPFS : upload metadata
IPFS --> server : IPFS hash

' No error handling here for now
server -> nft_marketplace : request mint with IPFS hash
nft_marketplace --> server : success
server --> frontend : nft minted
frontend --> user : new nft


@enduml
```
