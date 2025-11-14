class bank:

    conto=0

    def __init__(self,name,nummer):
        self.name= name
        self.nummer=nummer
        bank.conto+=nummer

    def add_conto(self,nummer1):
        bank.conto+=nummer1

    def rest_conto(self,nummer2):
         bank.conto-=nummer2

    def info(self):
        print(f"{self.name}  added {bank.conto}")

    def __str__(self):
        return f"Name ist {self.name}  ist conto {bank.conto} "


David_private_conto=bank("david",2000)
Roman_private_conto=bank("roman",1000)

if __name__=="__main__":
    Roman_private_conto.add_conto(2000)
    print(Roman_private_conto)
    Roman_private_conto.rest_conto(1500)
    print(Roman_private_conto)

    print(f"{Roman_private_conto} und {David_private_conto}")
    print(Roman_private_conto.info())