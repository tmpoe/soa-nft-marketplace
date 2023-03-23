```plantuml
@startuml
actor user
participant Frontend as frontend
participant "Backend" as backend
participant "Fee Gatekeeper" as fee_gatekeeper <<contract>>
participant "Cat Attributes" as cat_attributes <<contract>>
participant "Oracle" as oracle
participant "IPFS" as ipfs <<pinata>>
participant "Nft Marketplace" as nft_marketplace <<contract>>
participant "Cat Nft" as cat_nft <<contract>>

user --> frontend : mint nft
frontend --> backend : request with fee
backend --> fee_gatekeeper

alt If fee < mint fee
    fee_gatekeeper --> backend : deny
    backend --> frontend : deny
    frontend --> user : insufficient funds provided
end

fee_gatekeeper --> nft_marketplace : transfer funds

alt If fund transfer fails
    nft_marketplace --> fee_gatekeeper : revert
    fee_gatekeeper --> backend : something went wrong
    backend --> frontend : something went wrong
    frontend --> user : try again
end

backend --> cat_attributes : request cat attributes
cat_attributes --> oracle : request random numbers
oracle --> cat_attributes : send random numbers

backend --> IPFS : upload metadata
IPFS --> backend : IPFS hash

' No error handling here for now
backend --> nft_marketplace : request mint with IPFS hash
nft_marketplace --> backend : success
backend --> frontend : nft minted
frontend --> user : new nft


@enduml
```
